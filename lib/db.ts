import { neon } from "@neondatabase/serverless";
import type { AdapterAccountType } from "next-auth/adapters";
import { drizzle } from "drizzle-orm/neon-http";
import {
  pgTable,
  text,
  integer,
  timestamp,
  primaryKey,
  boolean,
  real,
} from "drizzle-orm/pg-core";

export const db = drizzle(neon(process.env.DATABASE_URL!));

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
);

export const wishlists = pgTable("wishlist", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  favorite: boolean("favorite").notNull().default(false),
  shared: boolean("shared").notNull().default(false),
  shareId: text("shareId").unique(),
  coverImage: text("coverImage"),
});

export const wishes = pgTable("wish", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  price: real("price"),
  currency: text("currency").notNull().default("USD"),
  imageUrl: text("imageUrl"),
  destinationUrl: text("destinationUrl"),
  description: text("description"),
  quantity: integer("quantity").notNull().default(1),
  wishlistId: text("wishlistId")
    .notNull()
    .references(() => wishlists.id, { onDelete: "cascade" }),
  verticalPosition: integer("verticalPosition").default(50),
  horizontalPosition: integer("horizontalPosition").default(50),
  imageZoom: real("imageZoom").default(1),
  position: integer("position").notNull(),
  autoUpdatePrice: boolean("autoUpdatePrice").notNull().default(false),
  priceUpdateFailures: integer("price_update_failures").notNull().default(0),
  lastPriceUpdateAttempt: timestamp("last_price_update_attempt", {
    mode: "date",
  }),
});

export const wishReservations = pgTable("wish_reservations", {
  id: text("id").primaryKey().notNull(),
  wishId: text("wish_id")
    .notNull()
    .references(() => wishes.id, { onDelete: "cascade" }),
  reservedBy: text("reserved_by").notNull(), // Email or name of person reserving
  reservedAt: timestamp("reserved_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
