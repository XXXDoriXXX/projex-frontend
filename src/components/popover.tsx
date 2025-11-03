"use client"

import * as React from "react"
import * as PopoverPrimitives from "@radix-ui/react-popover"
import {cn} from "../shared/utils/utils.ts";

const Popover = PopoverPrimitives.Root

const PopoverTrigger = PopoverPrimitives.Trigger

const PopoverContent = React.forwardRef<
    React.ElementRef<typeof PopoverPrimitives.Content>,
    React.ComponentPropsWithoutRef<typeof PopoverPrimitives.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
    <PopoverPrimitives.Portal>
        <PopoverPrimitives.Content
            ref={ref}
            align={align}
            sideOffset={sideOffset}
            className={cn(
                "z-50 w-72 rounded-2xl border border-border/50 bg-card p-4 text-foreground shadow-xl outline-none",
                // Стилі, що відповідають твоїй сторінці (backdrop-blur, bg-card/50)
                "bg-card/70 backdrop-blur-2xl",
                // Анімації (можеш налаштувати)
                "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
                "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                "data-[side=bottom]:slide-in-from-top-2",
                "data-[side=left]:slide-in-from-right-2",
                "data-[side=right]:slide-in-from-left-2",
                "data-[side=top]:slide-in-from-bottom-2",
                className
            )}
            {...props}
        />
    </PopoverPrimitives.Portal>
))
PopoverContent.displayName = PopoverPrimitives.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }