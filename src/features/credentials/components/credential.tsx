"use client"

import { CredentialType } from "@/generated/prisma/enums";
import { useParams, useRouter } from "next/navigation";
import { useCreateCredential, useSuspenseCredential, useUpdateCredential } from "../hooks/use-credentials";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";


const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(CredentialType),
    value: z.string().min(1, "API key is required")
})

type FormValues = z.infer<typeof formSchema>

const credentialTypeOptions = [
    {
        value: CredentialType.OPENAI,
        label: "OpenAI",
        logo: "/logos/openai.svg"
    },
    {
        value: CredentialType.GEMINI,
        label: "Gemini",
        logo: "/logos/gemini.svg"
    },
    {
        value: CredentialType.ANTHROPIC,
        label: "Anthropic",
        logo: "/logos/anthropic.svg"
    }
]

interface CredentialFormProps {
    initialData?: {
        id?: string;
        name: string;
        type: CredentialType;
        value: string;
    };
}

export const CredentialForm = ({
    initialData
}: CredentialFormProps) => {
    const router = useRouter();
    const createCredential = useCreateCredential();
    const updateCredential = useUpdateCredential();
    const { handleError, modal } = useUpgradeModal();

    const isEdit = !!initialData?.id;
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            type: initialData?.type || CredentialType.OPENAI,
            value: initialData?.value || ""
        }
    });

    const onSubmit = async (values: FormValues) => {
        if (isEdit && initialData?.id) {
            await updateCredential.mutateAsync({
                id: initialData!.id,
                ...values
            }, {
                onSuccess: () => {
                    router.push(`/credentials/${initialData!.id}`);
                },
                onError: (error) => {
                    handleError(error);
                }
            });
        } else {
            await createCredential.mutateAsync({
                ...values
            },
                {
                    onSuccess: (data) => {
                        router.push(`/credentials/${data.id}`);
                    },
                    onError: (error) => {
                        handleError(error);
                    }
                }
            );
        }
    }

    return (
        <>
            {modal}
            <Card className="shadow-none">
                <CardHeader>
                    <CardTitle>
                        {isEdit ? "Edit Credential" : "Add Credential"}
                    </CardTitle>
                    <CardDescription>
                        {
                            isEdit
                                ? "Update your API key or credential details"
                                : "Add a new API key or credential to your account"
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FieldGroup>
                            <Controller
                                control={form.control}
                                name="name"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="method">Name</FieldLabel>
                                        <Input
                                            {...field}
                                            placeholder="My API key"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Controller
                                control={form.control}
                                name="type"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="type">Type</FieldLabel>
                                        <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger id="type" className="w-full" aria-invalid={fieldState.invalid}>
                                                <SelectValue placeholder="Select a type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    credentialTypeOptions.map(({ value, label, logo }) => (
                                                        <SelectItem key={value} value={value}>
                                                            <div className="flex items-center gap-2">
                                                                <Image
                                                                    src={logo}
                                                                    alt={label}
                                                                    width={16}
                                                                    height={16}
                                                                />
                                                                {label}
                                                            </div>
                                                        </SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Controller
                                control={form.control}
                                name="value"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="value">Value</FieldLabel>
                                        <Input
                                            {...field}
                                            type="password"
                                            placeholder="sk-..."
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                disabled={
                                    createCredential.isPending ||
                                    updateCredential.isPending
                                }
                            >
                                {isEdit ? "Update" : "Add"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                asChild
                            >
                                <Link href={"/credentials"} prefetch>
                                    Cancel
                                </Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </>
    )


}

export const CredentialView = ({ credentialId }: { credentialId: string }) => {
    const { data: credential } = useSuspenseCredential(credentialId);

    return (<CredentialForm initialData={credential} />)
}