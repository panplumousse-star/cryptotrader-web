import * as React from "react"
import Image from "next/image"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const logoVariants = cva("relative flex-shrink-0", {
  variants: {
    size: {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-14 w-14",
      xl: "h-24 w-24",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 96,
} as const

interface LogoProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof logoVariants> {
  alt?: string
}

function Logo({ className, size = "md", alt = "CryptoTrader Logo", ...props }: LogoProps) {
  const pixelSize = sizeMap[size || "md"]

  return (
    <div
      data-slot="logo"
      className={cn(logoVariants({ size, className }))}
      {...props}
    >
      <Image
        src="/logo.png"
        alt={alt}
        width={pixelSize}
        height={pixelSize}
        className="object-contain"
        priority
      />
    </div>
  )
}

export { Logo, logoVariants }
