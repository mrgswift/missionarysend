import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { setResponseStatus } from '@tanstack/react-start/server'
import { authMiddleware } from './auth'
import { db } from '../lib/db'
import { Query } from 'node-appwrite'
import type { Reactions } from '../lib/appwrite.types'

// ============================================
// COMMENTS
// ============================================

// Get comments for a trip
const getCommentsSchema = z.object({
  tripId: z.string().min(1, 'Trip ID is required'),
})

export const getCommentsFn = createServerFn({ method: 'GET' })
  .inputValidator(getCommentsSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      // Get all comments for this trip
      const commentsResult = await db.comments.list([
        Query.equal('parentType', ['trip']),
        Query.equal('parentId', [data.tripId]),
        Query.orderDesc('$createdAt'),
        Query.limit(100),
      ])

      const comments = commentsResult.rows

      // Get all reactions for these comments
      const commentIds = comments.map((c) => c.$id)
      let reactions: Reactions[] = []

      if (commentIds.length > 0) {
        const reactionsResult = await db.reactions.list([
          Query.equal('commentId', commentIds),
          Query.limit(500),
        ])
        reactions = reactionsResult.rows
      }

      // Group reactions by comment
      const reactionsByComment: Record<
        string,
        { type: string; count: number; userReacted: boolean; users: string[] }[]
      > = {}

      for (const reaction of reactions) {
        if (!reactionsByComment[reaction.commentId]) {
          reactionsByComment[reaction.commentId] = []
        }

        const existing = reactionsByComment[reaction.commentId].find(
          (r) => r.type === reaction.reactionType,
        )

        if (existing) {
          existing.count++
          if (reaction.userId === currentUser.$id) {
            existing.userReacted = true
          }
          // Get user name from reactions (we'll need to fetch user profiles)
          existing.users.push(reaction.userId)
        } else {
          reactionsByComment[reaction.commentId].push({
            type: reaction.reactionType,
            count: 1,
            userReacted: reaction.userId === currentUser.$id,
            users: [reaction.userId],
          })
        }
      }

      // Fetch user names for reactions
      const uniqueUserIds = Array.from(new Set(reactions.map((r) => r.userId)))
      const userNames: Record<string, string> = {}

      for (const userId of uniqueUserIds) {
        try {
          const user = await db.users.get(userId)
          userNames[userId] = user?.name || 'Anonymous'
        } catch {
          userNames[userId] = 'Anonymous'
        }
      }

      // Replace user IDs with names in reactions
      for (const commentId in reactionsByComment) {
        for (const reaction of reactionsByComment[commentId]) {
          reaction.users = reaction.users.map(
            (userId) => userNames[userId] || 'Anonymous',
          )
        }
      }

      // Build comment tree (top-level and replies)
      const topLevelComments = comments.filter((c) => !c.parentCommentId)
      const replies = comments.filter((c) => c.parentCommentId)

      const commentsWithReplies = topLevelComments.map((comment) => ({
        ...comment,
        reactions: reactionsByComment[comment.$id] || [],
        replies: replies
          .filter((r) => r.parentCommentId === comment.$id)
          .map((reply) => ({
            ...reply,
            reactions: reactionsByComment[reply.$id] || [],
          })),
      }))

      return { comments: commentsWithReplies }
    } catch (error) {
      console.error('Error fetching comments:', error)
      setResponseStatus(500)
      throw { message: 'Failed to fetch comments', status: 500 }
    }
  })

// Create a comment
const createCommentSchema = z.object({
  tripId: z.string().min(1, 'Trip ID is required'),
  content: z.string().min(1, 'Comment cannot be empty').max(2000),
  parentCommentId: z.string().nullable().optional(),
})

export const createCommentFn = createServerFn({ method: 'POST' })
  .inputValidator(createCommentSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      // Get user profile for author name (may not exist for all users)
      let authorName = currentUser.name || 'Anonymous'
      try {
        const userProfile = await db.users.get(currentUser.$id)
        if (userProfile?.name) {
          authorName = userProfile.name
        }
      } catch {
        // User profile doesn't exist, use auth account name
        authorName = currentUser.name || 'Anonymous'
      }

      const comment = await db.comments.create({
        createdBy: currentUser.$id,
        parentType: 'trip',
        parentId: data.tripId,
        content: data.content.trim(),
        authorName,
        parentCommentId: data.parentCommentId || null,
      })

      // If this is a reply, notify the parent comment author
      if (data.parentCommentId) {
        try {
          const parentComment = await db.comments.get(data.parentCommentId)

          // Don't notify yourself
          if (parentComment.createdBy !== currentUser.$id) {
            await db.notifications.create({
              createdBy: currentUser.$id,
              userId: parentComment.createdBy,
              type: 'comment_reply',
              title: 'New reply to your comment',
              message: `${authorName} replied: "${data.content.trim().slice(0, 100)}${data.content.length > 100 ? '...' : ''}"`,
              linkUrl: `/trip/${data.tripId}?commentId=${comment.$id}`,
              isRead: false,
              relatedId: comment.$id,
              isVisible: true,
            })
          }
        } catch (notifyError) {
          // Don't fail the comment creation if notification fails
          console.error('Error creating reply notification:', notifyError)
        }
      }

      return { comment }
    } catch (error) {
      console.error('Error creating comment:', error)
      setResponseStatus(500)
      throw { message: 'Failed to create comment', status: 500 }
    }
  })

// Delete a comment
const deleteCommentSchema = z.object({
  commentId: z.string().min(1, 'Comment ID is required'),
})

export const deleteCommentFn = createServerFn({ method: 'POST' })
  .inputValidator(deleteCommentSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      // Get comment to verify ownership
      const comment = await db.comments.get(data.commentId)

      if (comment.createdBy !== currentUser.$id) {
        setResponseStatus(403)
        throw { message: 'You can only delete your own comments', status: 403 }
      }

      // Delete all replies to this comment
      const replies = await db.comments.list([
        Query.equal('parentCommentId', [data.commentId]),
      ])

      for (const reply of replies.rows) {
        await db.comments.delete(reply.$id)
      }

      // Delete the comment
      await db.comments.delete(data.commentId)

      return { success: true }
    } catch (error) {
      if ((error as { status?: number }).status) throw error
      console.error('Error deleting comment:', error)
      setResponseStatus(500)
      throw { message: 'Failed to delete comment', status: 500 }
    }
  })

// ============================================
// REACTIONS
// ============================================

// Toggle a reaction on a comment
const toggleReactionSchema = z.object({
  commentId: z.string().min(1, 'Comment ID is required'),
  reactionType: z.enum(['❤️', '👍', '🙏', '🎉', '😢', '😮']),
})

export const toggleReactionFn = createServerFn({ method: 'POST' })
  .inputValidator(toggleReactionSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      // Check if user already has ANY reaction on this comment
      const existingReactions = await db.reactions.list([
        Query.equal('commentId', [data.commentId]),
        Query.equal('userId', [currentUser.$id]),
      ])

      const existingSameReaction = existingReactions.rows.find(
        (r) => r.reactionType === data.reactionType,
      )

      if (existingSameReaction) {
        // User clicked the same reaction - remove it (toggle off)
        await db.reactions.delete(existingSameReaction.$id)
        return { action: 'removed' as const }
      } else {
        // Remove any existing different reaction first (replace behavior)
        for (const existingReaction of existingReactions.rows) {
          await db.reactions.delete(existingReaction.$id)
        }

        // Add the new reaction
        await db.reactions.create({
          createdBy: currentUser.$id,
          commentId: data.commentId,
          reactionType: data.reactionType,
          userId: currentUser.$id,
        })

        // Notify the comment author about the reaction
        try {
          const comment = await db.comments.get(data.commentId)

          // Don't notify yourself
          if (comment.createdBy !== currentUser.$id) {
            let reactorName = currentUser.name || 'Someone'
            try {
              const userProfile = await db.users.get(currentUser.$id)
              if (userProfile?.name) {
                reactorName = userProfile.name
              }
            } catch {
              // User profile doesn't exist, use auth account name
              reactorName = currentUser.name || 'Someone'
            }

            // Map emoji to readable name
            const reactionNames: Record<string, string> = {
              '❤️': 'loved',
              '👍': 'liked',
              '🙏': 'prayed for',
              '🎉': 'celebrated',
              '😢': 'expressed sympathy for',
              '😮': 'was amazed by',
            }

            const reactionVerb =
              reactionNames[data.reactionType] || 'reacted to'

            await db.notifications.create({
              createdBy: currentUser.$id,
              userId: comment.createdBy,
              type: 'comment_reaction',
              title: `${data.reactionType} Reaction on your comment`,
              message: `${reactorName} ${reactionVerb} your comment`,
              linkUrl: `/trip/${comment.parentId}?commentId=${data.commentId}`,
              isRead: false,
              relatedId: data.commentId,
              isVisible: true,
            })
          }
        } catch (notifyError) {
          // Don't fail the reaction if notification fails
          console.error('Error creating reaction notification:', notifyError)
        }

        return { action: 'added' as const }
      }
    } catch (error) {
      console.error('Error toggling reaction:', error)
      setResponseStatus(500)
      throw { message: 'Failed to toggle reaction', status: 500 }
    }
  })
