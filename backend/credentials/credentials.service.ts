import { prisma } from "../lib/prisma";

export const getAll = async (userId: string) => {
  return await prisma.Credentails.findMany({
    where: { id: userId }
  });
};

export const save = async (
  userId: string,
  type: string,
  name: string,
  value: string,
) => {
  const saving = await prisma.Credentails.create({
    where: { id: userId },
    data: {
      type,
      name,
      value,
    },
  });
  return {
    type: saving.type,
    name: saving.name,
  };
};
