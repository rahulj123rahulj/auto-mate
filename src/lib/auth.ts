import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { prisma } from "./db";
import { polar, checkout, portal } from "@polar-sh/better-auth";
import { polarClient } from "./polar";




export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: "bd906121-591b-4972-974c-19ea10ec3d25",
                            slug: "Auto-mate-Pro" // Custom slug for easy reference in Checkout URL, e.g. /checkout/Auto-mate-Pro
                        }
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL,
                    authenticatedUsersOnly: true
                }),
                portal()
            ],
        })
    ],
    emailAndPassword: {
        enabled : true,
        autoSignIn: true
    },
});