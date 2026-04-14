"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Image from "next/image";


const loginSchema = z.object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>


export function LoginForm() {
    const router = useRouter();
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    })

    const onSubmit = async (values: LoginFormValues) => {
        await authClient.signIn.email({
            email: values.email,
            password: values.password,
            callbackURL: "/",
        }, {
            onSuccess: () => {
                router.push("/")
            },
            onError: (ctx) => {
                toast.error(ctx.error.message);
            }
        })
    }

    const isPending = form.formState.isSubmitting;

    const signInGithub = async () => {
        await authClient.signIn.social({
            provider: "github"
        })
    }
    const signInGoogle = async () => {
        await authClient.signIn.social({
            provider: "google"
        })
    }


    return <div className="flex flex-col gap-6">
        <Card>
            <CardHeader className="text-center" >
                <CardTitle>
                    Welcome back
                </CardTitle>
                <CardDescription>
                    Login to continue
                </CardDescription>
                <CardContent className="my-4">
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid gap-6 ">
                            <div className="flex flex-col gap-4">
                                <Button
                                    variant={"outline"}
                                    className="w-full"
                                    type="button"
                                    disabled={isPending}
                                    onClick={signInGithub}
                                >
                                    <Image src="/logos/github.svg" alt="github" width={20} height={20} />
                                    Continue with Github
                                </Button>
                                <Button
                                    variant={"outline"}
                                    className="w-full"
                                    type="button"
                                    disabled={isPending}
                                    onClick={signInGoogle}
                                >
                                    <Image src="/logos/google.svg" alt="google" width={20} height={20} />
                                    Continue with Google
                                </Button>
                            </div>
                            <div className="grid gap-6" >
                                <FieldGroup>
                                    <Controller
                                        control={form.control}
                                        name="email"
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="form-rhf-demo-title">
                                                    Email
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    id="form-rhf-demo-title"
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder="m@example.com"
                                                    autoComplete="off"
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        control={form.control}
                                        name="password"
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="form-rhf-demo-title">
                                                    Password
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    type="password"
                                                    id="form-rhf-demo-title"
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder="********"
                                                    autoComplete="off"
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />
                                </FieldGroup>
                                <Button type="submit" className="w-full" disabled={isPending}>
                                    Login
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                Don&apos;t have an account?{" "}
                                <Link href={"/signup"}
                                    className=" underline underline-offset-4"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </CardHeader>
        </Card>
    </div>

}

