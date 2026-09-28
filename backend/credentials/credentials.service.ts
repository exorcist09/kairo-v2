import { prisma } from "../lib/prisma";

export const getAll = async (userId: string) => {
  return await prisma.credential.findMany({
    where: { userId },
  });
};

export const save = async (
  userId: string,
  type: string,
  name: string,
  value: string,
) => {
  const saving = await prisma.credential.create({
    data: {
      type,
      name,
      value,
      userId,
    },
  });
  
  return {
    type: saving.type,
    name: saving.name,
  };
};
