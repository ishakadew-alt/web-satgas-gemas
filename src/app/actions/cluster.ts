"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Get All Clusters
export async function getClustersData() {
  try {
    const clusters = await prisma.cluster.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: "asc" },
    });
    return clusters;
  } catch (error) {
    console.error("Get Clusters Error:", error);
    return [];
  }
}

// Create Cluster
export async function createCluster(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || "";

    if (!name) {
      return { success: false, error: "Nama Klaster wajib diisi." };
    }

    await prisma.cluster.create({
      data: { name, description },
    });

    revalidatePath("/admin/clusters");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Create Cluster Error:", error);
    return { success: false, error: "Gagal menambahkan klaster." };
  }
}

// Update Cluster
export async function updateCluster(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || "";

    if (!name) {
      return { success: false, error: "Nama Klaster wajib diisi." };
    }

    await prisma.cluster.update({
      where: { id },
      data: { name, description },
    });

    revalidatePath("/admin/clusters");
    return { success: true };
  } catch (error: any) {
    console.error("Update Cluster Error:", error);
    return { success: false, error: "Gagal memperbarui klaster." };
  }
}

// Delete Cluster
export async function deleteCluster(id: string) {
  try {
    await prisma.cluster.delete({
      where: { id },
    });

    revalidatePath("/admin/clusters");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Cluster Error:", error);
    return {
      success: false,
      error: "Gagal menghapus klaster. Pastikan tidak ada user di dalam klaster ini.",
    };
  }
}