import { Role, Level } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nip: string;
      role: Role;
      level?: Level | null;
      clusterId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    nip: string;
    role: Role;
    level?: Level | null;
    clusterId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nip: string;
    role: Role;
    level?: Level | null;
    clusterId?: string | null;
  }
}