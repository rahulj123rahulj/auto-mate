"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod"


const formSchema = z.object({
    variableName: z
        .string()
        .min(1, { message: "Variable name is required" })
        .regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/, { message: "Variable name must start with a letter or underscore and contains only letters, numbers, and underscores" }),
    username: z.string().optional(),
    content: z.string()
        .min(1, { message: "Message content is required" })
        .max(2000, { message: "Discord messages cannot exceed 2000 characters" }),
    webhookUrl: z.string().min(1, { message: "Invalid webhook URL" }),
})

export type DiscordFormValues = z.infer<typeof formSchema>

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (values: DiscordFormValues) => void
    defaultValues?: Partial<DiscordFormValues>
}

export const DiscordDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {}
}: Props) => {
    const form = useForm<DiscordFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            username: defaultValues.username || "",
            content: defaultValues.content || "",
            webhookUrl: defaultValues.webhookUrl || ""
        }
    })

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "",
                username: defaultValues.username || "",
                content: defaultValues.content || "",
                webhookUrl: defaultValues.webhookUrl || ""
            })
        }
    }, [open, defaultValues, form])

    const watchVariableName = form.watch("variableName") || "myDiscord";


    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values);
        onOpenChange(false)
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Discord Configuration</DialogTitle>
                    <DialogDescription>
                        Configure the Discord webhook settings for this node.
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-8 mt-4">
                    <FieldGroup>
                        <Controller
                            name="variableName"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="method">Variable Name</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="myDiscord"
                                    />
                                    <FieldDescription>
                                        Use this name to reference the result in other nodes:{" "}
                                        {`{{${watchVariableName}.text}}`}
                                    </FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="webhookUrl"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="webhookUrl">Webhook URL</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="https://discord.com/api/webhooks/..."
                                    />
                                    <FieldDescription>
                                        Get this from Discord: Channel Settings → Intergrations → Webhooks
                                    </FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="content"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="method">Message Content</FieldLabel>
                                    <Textarea
                                        placeholder={`Summary: {{myGemini.text}}`}
                                        className="min-h-[80px] font-mono text-sm"
                                        {...field}

                                    />
                                    <FieldDescription>
                                        The message to send. Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify objects
                                    </FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="username"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="method">Bot username (optional)</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="Workflow Bot"
                                    />
                                    <FieldDescription>
                                        Override the webhook&apos;s default username.
                                    </FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    <DialogFooter className="mt-4">
                        <Button type="submit">Save</Button>
                    </DialogFooter>

                </form>
            </DialogContent>
        </Dialog>
    )
}