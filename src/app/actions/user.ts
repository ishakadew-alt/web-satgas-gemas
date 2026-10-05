"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// READ
export async function getUsers() {
  return await prisma.user.findMany({
    include: { cluster: true },
    orderBy: { createdAt: "desc" },
  });
}

// CREATE
export async function createUser(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const nip = formData.get("nip") as string;
    const role = formData.get("role") as string;
    const clusterId = formData.get("clusterId") as string;
    const password = formData.get("password") as string || "123456";

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        nip,
        role: role as any,
        clusterId: clusterId || null,
        password: hashedPassword,
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// UPDATE (Tambahan baru agar tidak error)
export async function updateUser(userId: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const nip = formData.get("nip") as string;
    const role = formData.get("role") as string;
    const clusterId = formData.get("clusterId") as string;
    const password = formData.get("password") as string;

    const dataToUpdate: any = {
      name,
      nip,
      role: role as any,
      clusterId: clusterId || null,
    };

    // Hanya update password jika form password diisi
    if (password && password.trim() !== "") {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// DELETE
export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
} 