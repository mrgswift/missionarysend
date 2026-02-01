import {
  Client,
  TablesDB,
  ID,
  type Models,
  Permission,
  Role,
} from 'node-appwrite'
import type {
  Users,
  OrganizationMembers,
  Trips,
  TripFollowers,
  Donations,
  TripUpdates,
  Comments,
  Reactions,
  JournalEntries,
  PrayerIntercessors,
  PrayerRequests,
  Notifications,
  TripMissionaries,
} from './appwrite.types'

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!)

const tablesDB = new TablesDB(client)

export const db = {
  users: {
    create: (
      data: Omit<Users, keyof Models.Row>,
      options?: { rowId?: string; permissions?: string[] },
    ) =>
      tablesDB.createRow<Users>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'users',
        rowId: options?.rowId ?? ID.unique(),
        data,
        permissions: [
          Permission.write(Role.user(data.createdBy)),
          Permission.read(Role.user(data.createdBy)),
          Permission.update(Role.user(data.createdBy)),
          Permission.delete(Role.user(data.createdBy)),
        ],
      }),
    get: (id: string) =>
      tablesDB.getRow<Users>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'users',
        rowId: id,
      }),
    update: (
      id: string,
      data: Partial<Omit<Users, keyof Models.Row>>,
      options?: { permissions?: string[] },
    ) =>
      tablesDB.updateRow<Users>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'users',
        rowId: id,
        data,
        ...(options?.permissions ? { permissions: options.permissions } : {}),
      }),
    delete: (id: string) =>
      tablesDB.deleteRow({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'users',
        rowId: id,
      }),
    list: (queries?: string[]) =>
      tablesDB.listRows<Users>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'users',
        queries,
      }),
  },
  organizationMembers: {
    create: (
      data: Omit<OrganizationMembers, keyof Models.Row>,
      options?: { rowId?: string; permissions?: string[] },
    ) =>
      tablesDB.createRow<OrganizationMembers>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'organizationMembers',
        rowId: options?.rowId ?? ID.unique(),
        data,
        permissions: [
          Permission.write(Role.user(data.createdBy)),
          Permission.read(Role.user(data.createdBy)),
          Permission.update(Role.user(data.createdBy)),
          Permission.delete(Role.user(data.createdBy)),
        ],
      }),
    get: (id: string) =>
      tablesDB.getRow<OrganizationMembers>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'organizationMembers',
        rowId: id,
      }),
    update: (
      id: string,
      data: Partial<Omit<OrganizationMembers, keyof Models.Row>>,
      options?: { permissions?: string[] },
    ) =>
      tablesDB.updateRow<OrganizationMembers>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'organizationMembers',
        rowId: id,
        data,
        ...(options?.permissions ? { permissions: options.permissions } : {}),
      }),
    delete: (id: string) =>
      tablesDB.deleteRow({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'organizationMembers',
        rowId: id,
      }),
    list: (queries?: string[]) =>
      tablesDB.listRows<OrganizationMembers>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'organizationMembers',
        queries,
      }),
  },
  trips: {
    create: (
      data: Omit<Trips, keyof Models.Row>,
      options?: { rowId?: string; permissions?: string[] },
    ) =>
      tablesDB.createRow<Trips>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'trips',
        rowId: options?.rowId ?? ID.unique(),
        data,
        permissions: [
          Permission.write(Role.user(data.createdBy)),
          Permission.read(Role.user(data.createdBy)),
          Permission.update(Role.user(data.createdBy)),
          Permission.delete(Role.user(data.createdBy)),
        ],
      }),
    get: (id: string) =>
      tablesDB.getRow<Trips>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'trips',
        rowId: id,
      }),
    update: (
      id: string,
      data: Partial<Omit<Trips, keyof Models.Row>>,
      options?: { permissions?: string[] },
    ) =>
      tablesDB.updateRow<Trips>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'trips',
        rowId: id,
        data,
        ...(options?.permissions ? { permissions: options.permissions } : {}),
      }),
    delete: (id: string) =>
      tablesDB.deleteRow({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'trips',
        rowId: id,
      }),
    list: (queries?: string[]) =>
      tablesDB.listRows<Trips>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'trips',
        queries,
      }),
  },
  tripFollowers: {
    create: (
      data: Omit<TripFollowers, keyof Models.Row>,
      options?: { rowId?: string; permissions?: string[] },
    ) =>
      tablesDB.createRow<TripFollowers>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'tripFollowers',
        rowId: options?.rowId ?? ID.unique(),
        data,
        permissions: [
          Permission.write(Role.user(data.createdBy)),
          Permission.read(Role.user(data.createdBy)),
          Permission.update(Role.user(data.createdBy)),
          Permission.delete(Role.user(data.createdBy)),
        ],
      }),
    get: (id: string) =>
      tablesDB.getRow<TripFollowers>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'tripFollowers',
        rowId: id,
      }),
    update: (
      id: string,
      data: Partial<Omit<TripFollowers, keyof Models.Row>>,
      options?: { permissions?: string[] },
    ) =>
      tablesDB.updateRow<TripFollowers>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'tripFollowers',
        rowId: id,
        data,
        ...(options?.permissions ? { permissions: options.permissions } : {}),
      }),
    delete: (id: string) =>
      tablesDB.deleteRow({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'tripFollowers',
        rowId: id,
      }),
    list: (queries?: string[]) =>
      tablesDB.listRows<TripFollowers>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'tripFollowers',
        queries,
      }),
  },
  donations: {
    create: (
      data: Omit<Donations, keyof Models.Row>,
      options?: { rowId?: string; permissions?: string[] },
    ) =>
      tablesDB.createRow<Donations>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'donations',
        rowId: options?.rowId ?? ID.unique(),
        data,
        permissions: [
          Permission.write(Role.user(data.createdBy)),
          Permission.read(Role.user(data.createdBy)),
          Permission.update(Role.user(data.createdBy)),
          Permission.delete(Role.user(data.createdBy)),
        ],
      }),
    get: (id: string) =>
      tablesDB.getRow<Donations>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'donations',
        rowId: id,
      }),
    update: (
      id: string,
      data: Partial<Omit<Donations, keyof Models.Row>>,
      options?: { permissions?: string[] },
    ) =>
      tablesDB.updateRow<Donations>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'donations',
        rowId: id,
        data,
        ...(options?.permissions ? { permissions: options.permissions } : {}),
      }),
    delete: (id: string) =>
      tablesDB.deleteRow({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'donations',
        rowId: id,
      }),
    list: (queries?: string[]) =>
      tablesDB.listRows<Donations>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'donations',
        queries,
      }),
  },
  tripUpdates: {
    create: (
      data: Omit<TripUpdates, keyof Models.Row>,
      options?: { rowId?: string; permissions?: string[] },
    ) =>
      tablesDB.createRow<TripUpdates>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'tripUpdates',
        rowId: options?.rowId ?? ID.unique(),
        data,
        permissions: [
          Permission.write(Role.user(data.createdBy)),
          Permission.read(Role.user(data.createdBy)),
          Permission.update(Role.user(data.createdBy)),
          Permission.delete(Role.user(data.createdBy)),
        ],
      }),
    get: (id: string) =>
      tablesDB.getRow<TripUpdates>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'tripUpdates',
        rowId: id,
      }),
    update: (
      id: string,
      data: Partial<Omit<TripUpdates, keyof Models.Row>>,
      options?: { permissions?: string[] },
    ) =>
      tablesDB.updateRow<TripUpdates>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'tripUpdates',
        rowId: id,
        data,
        ...(options?.permissions ? { permissions: options.permissions } : {}),
      }),
    delete: (id: string) =>
      tablesDB.deleteRow({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'tripUpdates',
        rowId: id,
      }),
    list: (queries?: string[]) =>
      tablesDB.listRows<TripUpdates>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'tripUpdates',
        queries,
      }),
  },
  comments: {
    create: (
      data: Omit<Comments, keyof Models.Row>,
      options?: { rowId?: string; permissions?: string[] },
    ) =>
      tablesDB.createRow<Comments>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'comments',
        rowId: options?.rowId ?? ID.unique(),
        data,
        permissions: [
          Permission.write(Role.user(data.createdBy)),
          Permission.read(Role.user(data.createdBy)),
          Permission.update(Role.user(data.createdBy)),
          Permission.delete(Role.user(data.createdBy)),
        ],
      }),
    get: (id: string) =>
      tablesDB.getRow<Comments>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'comments',
        rowId: id,
      }),
    update: (
      id: string,
      data: Partial<Omit<Comments, keyof Models.Row>>,
      options?: { permissions?: string[] },
    ) =>
      tablesDB.updateRow<Comments>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'comments',
        rowId: id,
        data,
        ...(options?.permissions ? { permissions: options.permissions } : {}),
      }),
    delete: (id: string) =>
      tablesDB.deleteRow({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'comments',
        rowId: id,
      }),
    list: (queries?: string[]) =>
      tablesDB.listRows<Comments>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'comments',
        queries,
      }),
  },
  reactions: {
    create: (
      data: Omit<Reactions, keyof Models.Row>,
      options?: { rowId?: string; permissions?: string[] },
    ) =>
      tablesDB.createRow<Reactions>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'reactions',
        rowId: options?.rowId ?? ID.unique(),
        data,
        permissions: [
          Permission.write(Role.user(data.createdBy)),
          Permission.read(Role.user(data.createdBy)),
          Permission.update(Role.user(data.createdBy)),
          Permission.delete(Role.user(data.createdBy)),
        ],
      }),
    get: (id: string) =>
      tablesDB.getRow<Reactions>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'reactions',
        rowId: id,
      }),
    update: (
      id: string,
      data: Partial<Omit<Reactions, keyof Models.Row>>,
      options?: { permissions?: string[] },
    ) =>
      tablesDB.updateRow<Reactions>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'reactions',
        rowId: id,
        data,
        ...(options?.permissions ? { permissions: options.permissions } : {}),
      }),
    delete: (id: string) =>
      tablesDB.deleteRow({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'reactions',
        rowId: id,
      }),
    list: (queries?: string[]) =>
      tablesDB.listRows<Reactions>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'reactions',
        queries,
      }),
  },
  journalEntries: {
    create: (
      data: Omit<JournalEntries, keyof Models.Row>,
      options?: { rowId?: string; permissions?: string[] },
    ) =>
      tablesDB.createRow<JournalEntries>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'journalEntries',
        rowId: options?.rowId ?? ID.unique(),
        data,
        permissions: [
          Permission.write(Role.user(data.createdBy)),
          Permission.read(Role.user(data.createdBy)),
          Permission.update(Role.user(data.createdBy)),
          Permission.delete(Role.user(data.createdBy)),
        ],
      }),
    get: (id: string) =>
      tablesDB.getRow<JournalEntries>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'journalEntries',
        rowId: id,
      }),
    update: (
      id: string,
      data: Partial<Omit<JournalEntries, keyof Models.Row>>,
      options?: { permissions?: string[] },
    ) =>
      tablesDB.updateRow<JournalEntries>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'journalEntries',
        rowId: id,
        data,
        ...(options?.permissions ? { permissions: options.permissions } : {}),
      }),
    delete: (id: string) =>
      tablesDB.deleteRow({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'journalEntries',
        rowId: id,
      }),
    list: (queries?: string[]) =>
      tablesDB.listRows<JournalEntries>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'journalEntries',
        queries,
      }),
  },
  prayerIntercessors: {
    create: (
      data: Omit<PrayerIntercessors, keyof Models.Row>,
      options?: { rowId?: string; permissions?: string[] },
    ) =>
      tablesDB.createRow<PrayerIntercessors>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'prayerIntercessors',
        rowId: options?.rowId ?? ID.unique(),
        data,
        permissions: [
          Permission.write(Role.user(data.createdBy)),
          Permission.read(Role.user(data.createdBy)),
          Permission.update(Role.user(data.createdBy)),
          Permission.delete(Role.user(data.createdBy)),
        ],
      }),
    get: (id: string) =>
      tablesDB.getRow<PrayerIntercessors>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'prayerIntercessors',
        rowId: id,
      }),
    update: (
      id: string,
      data: Partial<Omit<PrayerIntercessors, keyof Models.Row>>,
      options?: { permissions?: string[] },
    ) =>
      tablesDB.updateRow<PrayerIntercessors>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'prayerIntercessors',
        rowId: id,
        data,
        ...(options?.permissions ? { permissions: options.permissions } : {}),
      }),
    delete: (id: string) =>
      tablesDB.deleteRow({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'prayerIntercessors',
        rowId: id,
      }),
    list: (queries?: string[]) =>
      tablesDB.listRows<PrayerIntercessors>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'prayerIntercessors',
        queries,
      }),
  },
  prayerRequests: {
    create: (
      data: Omit<PrayerRequests, keyof Models.Row>,
      options?: { rowId?: string; permissions?: string[] },
    ) =>
      tablesDB.createRow<PrayerRequests>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'prayerRequests',
        rowId: options?.rowId ?? ID.unique(),
        data,
        permissions: [
          Permission.write(Role.user(data.createdBy)),
          Permission.read(Role.user(data.createdBy)),
          Permission.update(Role.user(data.createdBy)),
          Permission.delete(Role.user(data.createdBy)),
        ],
      }),
    get: (id: string) =>
      tablesDB.getRow<PrayerRequests>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'prayerRequests',
        rowId: id,
      }),
    update: (
      id: string,
      data: Partial<Omit<PrayerRequests, keyof Models.Row>>,
      options?: { permissions?: string[] },
    ) =>
      tablesDB.updateRow<PrayerRequests>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'prayerRequests',
        rowId: id,
        data,
        ...(options?.permissions ? { permissions: options.permissions } : {}),
      }),
    delete: (id: string) =>
      tablesDB.deleteRow({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'prayerRequests',
        rowId: id,
      }),
    list: (queries?: string[]) =>
      tablesDB.listRows<PrayerRequests>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'prayerRequests',
        queries,
      }),
  },
  notifications: {
    create: (
      data: Omit<Notifications, keyof Models.Row>,
      options?: { rowId?: string; permissions?: string[] },
    ) =>
      tablesDB.createRow<Notifications>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'notifications',
        rowId: options?.rowId ?? ID.unique(),
        data,
        permissions: [
          Permission.write(Role.user(data.createdBy)),
          Permission.read(Role.user(data.createdBy)),
          Permission.update(Role.user(data.createdBy)),
          Permission.delete(Role.user(data.createdBy)),
        ],
      }),
    get: (id: string) =>
      tablesDB.getRow<Notifications>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'notifications',
        rowId: id,
      }),
    update: (
      id: string,
      data: Partial<Omit<Notifications, keyof Models.Row>>,
      options?: { permissions?: string[] },
    ) =>
      tablesDB.updateRow<Notifications>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'notifications',
        rowId: id,
        data,
        ...(options?.permissions ? { permissions: options.permissions } : {}),
      }),
    delete: (id: string) =>
      tablesDB.deleteRow({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'notifications',
        rowId: id,
      }),
    list: (queries?: string[]) =>
      tablesDB.listRows<Notifications>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'notifications',
        queries,
      }),
  },
  tripMissionaries: {
    create: (
      data: Omit<TripMissionaries, keyof Models.Row>,
      options?: { rowId?: string; permissions?: string[] },
    ) =>
      tablesDB.createRow<TripMissionaries>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'tripMissionaries',
        rowId: options?.rowId ?? ID.unique(),
        data,
        permissions: [
          Permission.write(Role.user(data.createdBy)),
          Permission.read(Role.user(data.createdBy)),
          Permission.update(Role.user(data.createdBy)),
          Permission.delete(Role.user(data.createdBy)),
        ],
      }),
    get: (id: string) =>
      tablesDB.getRow<TripMissionaries>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'tripMissionaries',
        rowId: id,
      }),
    update: (
      id: string,
      data: Partial<Omit<TripMissionaries, keyof Models.Row>>,
      options?: { permissions?: string[] },
    ) =>
      tablesDB.updateRow<TripMissionaries>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'tripMissionaries',
        rowId: id,
        data,
        ...(options?.permissions ? { permissions: options.permissions } : {}),
      }),
    delete: (id: string) =>
      tablesDB.deleteRow({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'tripMissionaries',
        rowId: id,
      }),
    list: (queries?: string[]) =>
      tablesDB.listRows<TripMissionaries>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'tripMissionaries',
        queries,
      }),
  },
}
