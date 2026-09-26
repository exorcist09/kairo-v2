import { prisma } from "../lib/prisma";


export const profile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    })

    if (!user) {
        throw new Error("User Not Found")
    }
    return user
}   