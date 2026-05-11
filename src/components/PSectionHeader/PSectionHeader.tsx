import { Stack } from "../PContainers";
import { PTypography } from "../PTypography";
import cn from "../../utils/cn";
import "./PSectionHeader.css";

export type PSectionHeaderVariant = "default" | "indexed";

export interface PSectionHeaderProps {
  title: string;
  index?: string | number;
  variant?: PSectionHeaderVariant;
  className?: string;
}

export default function PSectionHeader({
  title,
  index = "01",
  variant = "default",
  className,
}: PSectionHeaderProps) {
  if (variant === "indexed") {
    return (
      <div
        className={cn("p-section-header p-section-header--indexed", className)}
      >
        <PTypography
          as="span"
          className="p-section-header__mark"
          variant="body"
          aria-hidden="true"
        >
          —
        </PTypography>
        <PTypography
          as="span"
          className="p-section-header__index"
          variant="body"
        >
          {index}
        </PTypography>
        <PTypography
          as="span"
          className="p-section-header__divider"
          variant="body"
          aria-hidden="true"
        >
          |
        </PTypography>
        <PTypography as="h2" className="p-section-header__title" variant="body">
          {title}
        </PTypography>
      </div>
    );
  }

  return (
    <Stack
      className={cn("p-section-header p-section-header--default", className)}
    >
      <PTypography className="p-section-header__title" variant="body-wide">
        {title}
      </PTypography>
    </Stack>
  );
}
