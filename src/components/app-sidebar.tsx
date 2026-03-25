"use client";

import { CreditCardIcon, FolderOpenIcon, HistoryIcon, KeyIcon, LogOutIcon, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSubItem } from "./ui/sidebar";
import { authClient } from "@/lib/auth-client";


const menutItems = [
    {
        title: "Workflows",
        items: [
            {
                title: "Workflows",
                icon: FolderOpenIcon,
                url: "/workflows"
            },
            {
                title: "Credentials",
                icon: KeyIcon,
                url: "/credentials"
            },
            {
                title: "Executions",
                icon: HistoryIcon,
                url: "/executions"

            }
        ]
    }
]

export const AppSidebar = () => {
    const router = useRouter();
    const pathname = usePathname();
    console.log(pathname)
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenuSubItem>
                    <SidebarMenuButton isActive={false} className="gap-x-4 h-10 px-4" asChild>
                        <Link href="/" prefetch>
                            <Image
                                src="/logos/logo.svg"
                                alt="Logo"
                                width={30}
                                height={30}
                            />
                            <span className="font-semibold text-sm">
                                Auto Mate
                            </span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuSubItem>
            </SidebarHeader>
            <SidebarContent>
                {menutItems.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            isActive={
                                                item.url === "/"
                                                    ? pathname === "/"
                                                    : pathname.startsWith(item.url)
                                            }
                                            className="gap-x-4 h-10 px-4"
                                            asChild
                                        >
                                            <Link href={item.url} prefetch >
                                                <item.icon className="size-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip={"Upgrade to Pro"}
                            className="gap-x-4 h-10 px-4"
                            onClick={() => { }}
                        >
                            <StarIcon className="h-4 w-4" />
                            <span>Upgrade to Pro</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip={"Billing Portal"}
                            className="gap-x-4 h-10 px-4"
                            onClick={() => { }}
                        >
                            <CreditCardIcon className="h-4 w-4" />
                            <span>Billing Portal</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip={"Sign out"}
                            className="gap-x-4 h-10 px-4"
                            onClick={() => {
                                authClient.signOut({
                                    fetchOptions: {
                                        onSuccess: () => {
                                            router.push("/login")
                                        }
                                    }
                                });
                            }}
                        >
                            <LogOutIcon className="h-4 w-4" />
                            <span>Sign out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}