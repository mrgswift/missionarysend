import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { setResponseStatus } from '@tanstack/react-start/server'
import { authMiddleware } from './auth'
import { fileStorage } from '../lib/storage'
import { InputFile } from 'node-appwrite/file'
import { ID } from 'node-appwrite'

// Upload file schema
const uploadFileSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileData: z.string().min(1, 'File data is required'), // base64 encoded
  mimeType: z.string().min(1, 'MIME type is required'),
})

export const uploadFileFn = createServerFn({ method: 'POST' })
  .inputValidator(uploadFileSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      const storage = await fileStorage()
      if (!storage) {
        setResponseStatus(500)
        throw { message: 'Storage not initialized', status: 500 }
      }

      // Remove data URL prefix if present (e.g., "data:image/png;base64,")
      const base64Data = data.fileData.includes(',')
        ? data.fileData.split(',')[1]
        : data.fileData

      // Convert base64 to Buffer
      const buffer = Buffer.from(base64Data, 'base64')

      // Create InputFile from buffer
      const inputFile = InputFile.fromBuffer(buffer, data.fileName)

      // Upload to storage
      const file = await storage.create(ID.unique(), inputFile)

      return { fileId: file.$id, fileName: file.name }
    } catch (error) {
      console.error('Error uploading file:', error)
      setResponseStatus(500)
      throw { message: 'Failed to upload file', status: 500 }
    }
  })

// Delete file schema
const deleteFileSchema = z.object({
  fileId: z.string().min(1, 'File ID is required'),
})

export const deleteFileFn = createServerFn({ method: 'POST' })
  .inputValidator(deleteFileSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      const storage = await fileStorage()
      if (!storage) {
        setResponseStatus(500)
        throw { message: 'Storage not initialized', status: 500 }
      }

      await storage.delete(data.fileId)

      return { success: true }
    } catch (error) {
      console.error('Error deleting file:', error)
      setResponseStatus(500)
      throw { message: 'Failed to delete file', status: 500 }
    }
  })

// Get file preview URL
const getFilePreviewSchema = z.object({
  fileId: z.string().min(1, 'File ID is required'),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  quality: z.number().int().min(0).max(100).optional(),
})

export const getFilePreviewUrlFn = createServerFn({ method: 'GET' })
  .inputValidator(getFilePreviewSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      const storage = await fileStorage()
      if (!storage) {
        setResponseStatus(500)
        throw { message: 'Storage not initialized', status: 500 }
      }

      // Get preview URL
      const url = storage.getFilePreview(
        data.fileId,
        data.width,
        data.height,
        undefined, // gravity
        data.quality,
      )

      return { url: url.toString() }
    } catch (error) {
      console.error('Error getting file preview:', error)
      setResponseStatus(500)
      throw { message: 'Failed to get file preview', status: 500 }
    }
  })
