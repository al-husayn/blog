import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import React from "react";
import path from "node:path";
import { readdirSync } from "node:fs";
import {
  MediaViewer,
  ImageViewer,
  VideoViewer,
} from "@/components/media-viewer";
import {
  Accordion as RadixAccordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Accordion as FumaAccordion,
  Accordions,
} from "fumadocs-ui/components/accordion";
import { Card as FumaCard, Cards as FumaCards } from "fumadocs-ui/components/card";
import { CodeBlock as FumaCodeBlock, Pre as FumaPre } from "fumadocs-ui/components/codeblock";
import { Callout } from "fumadocs-ui/components/callout";
import { Step as FumaStep, Steps as FumaSteps } from "fumadocs-ui/components/steps";
import { Tab as FumaTab, Tabs as FumaTabs } from "fumadocs-ui/components/tabs";
import type { LucideIcon } from "lucide-react";
import {
  Atom,
  BookOpen,
  Clapperboard,
  Clock3,
  Cog,
  Copy,
  Cuboid,
  Equal,
  FileCode2,
  GraduationCap,
  Layers,
  Lock,
  Microchip,
  Newspaper,
  Repeat,
  RotateCcw,
  Shuffle,
  Table2,
} from "lucide-react";
import { AuthorCard } from "@/components/author-card";
import { getAuthor } from "@/lib/authors";
import { CopyHeader } from "@/components/copy-header";
import { cn } from "@/lib/utils";
import type {
  AuthorProps,
  CardGroupProps,
  MdxCardProps,
  MdxPreProps,
  StepProps,
  TabProps,
  TabsProps,
} from "@/types/mdx";

const BLOG_ROUTE_PREFIX = "/blog";
const BLOG_CONTENT_DIRECTORY = path.join(process.cwd(), "blog", "content");
const BLOG_FILE_EXTENSIONS = new Set([".mdx", ".md"]);
const INTERNAL_CARD_ALLOWLIST = new Set(["/", "/about", "/rss.xml"]);

const toNormalizedPathname = (pathname: string): string => {
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (withLeadingSlash === "/") {
    return withLeadingSlash;
  }

  return withLeadingSlash.replace(/\/+$/, "");
};

const splitHref = (href: string): { pathname: string; suffix: string } => {
  const [pathname, ...suffixParts] = href.split(/(?=[?#])/);
  return {
    pathname,
    suffix: suffixParts.join(""),
  };
};

const isExternalHref = (href: string): boolean =>
  /^([a-z][a-z\d+.-]*:)?\/\//i.test(href) || /^[a-z][a-z\d+.-]*:/i.test(href);

const collectBlogCardTargets = (directory: string, parentSegments: string[] = []): string[] => {
  try {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      if (entry.name.startsWith(".")) {
        return [];
      }

      if (entry.isDirectory()) {
        return collectBlogCardTargets(path.join(directory, entry.name), [...parentSegments, entry.name]);
      }

      const extension = path.extname(entry.name).toLowerCase();
      if (!BLOG_FILE_EXTENSIONS.has(extension)) {
        return [];
      }

      const fileName = entry.name.slice(0, -extension.length);
      const rawSegments = [...parentSegments, fileName];
      const normalizedSegments =
        rawSegments[rawSegments.length - 1] === "index" ? rawSegments.slice(0, -1) : rawSegments;

      if (normalizedSegments.length === 0) {
        return [];
      }

      return [`${BLOG_ROUTE_PREFIX}/${normalizedSegments.join("/")}`];
    });
  } catch {
    return [];
  }
};

const BLOG_CARD_TARGETS = new Set(
  collectBlogCardTargets(BLOG_CONTENT_DIRECTORY).map((href) => toNormalizedPathname(href)),
);

const resolveCardHref = (
  href: string | undefined,
): { resolvedHref: string | undefined; unavailable: boolean } => {
  if (!href) {
    return { resolvedHref: href, unavailable: false };
  }

  const normalizedHref = href.trim();
  if (!normalizedHref || normalizedHref.startsWith("#") || isExternalHref(normalizedHref)) {
    return { resolvedHref: normalizedHref || undefined, unavailable: false };
  }

  const { pathname, suffix } = splitHref(normalizedHref);
  if (!pathname.startsWith("/")) {
    return { resolvedHref: normalizedHref, unavailable: false };
  }

  const normalizedPathname = toNormalizedPathname(pathname);
  if (INTERNAL_CARD_ALLOWLIST.has(normalizedPathname)) {
    return { resolvedHref: `${normalizedPathname}${suffix}`, unavailable: false };
  }

  if (normalizedPathname.startsWith(`${BLOG_ROUTE_PREFIX}/`)) {
    const isAvailable = BLOG_CARD_TARGETS.has(normalizedPathname);
    return {
      resolvedHref: isAvailable ? `${normalizedPathname}${suffix}` : undefined,
      unavailable: !isAvailable,
    };
  }

  const normalizedBlogPathname = toNormalizedPathname(`${BLOG_ROUTE_PREFIX}${normalizedPathname}`);
  const isAvailable = BLOG_CARD_TARGETS.has(normalizedBlogPathname);
  return {
    resolvedHref: isAvailable ? `${normalizedBlogPathname}${suffix}` : undefined,
    unavailable: !isAvailable,
  };
};

const createHeading = (level: number) => {
  const Heading = ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => {
    return <CopyHeader level={level} {...props}>{children}</CopyHeader>;
  };

  Heading.displayName = `Heading${level}`;
  return Heading;
};

function Author({ id }: AuthorProps) {
  const author = getAuthor(id);
  return <AuthorCard author={author} className="my-8" />;
}

const CARD_ICON_MAP: Record<string, LucideIcon> = {
  atom: Atom,
  book: BookOpen,
  clock: Clock3,
  clone: Copy,
  cube: Cuboid,
  equals: Equal,
  gear: Cog,
  "graduation-cap": GraduationCap,
  "layer-group": Layers,
  lock: Lock,
  microchip: Microchip,
  newspaper: Newspaper,
  repeat: Repeat,
  rotate: RotateCcw,
  shuffle: Shuffle,
  table: Table2,
  video: Clapperboard,
};

function Tabs({ children, items, ...props }: TabsProps) {
  const resolvedItems =
    items ??
    React.Children.toArray(children)
      .map((child) => {
        if (!React.isValidElement<TabProps>(child)) {
          return null;
        }

        return child.props.title ?? child.props.value ?? null;
      })
      .filter((value): value is string => typeof value === "string");

  return (
    <FumaTabs items={resolvedItems.length > 0 ? resolvedItems : undefined} {...props}>
      {children}
    </FumaTabs>
  );
}

function Tab({ title, value, ...props }: TabProps) {
  return <FumaTab value={value ?? title} {...props} />;
}

function resolveCardIcon(icon: MdxCardProps["icon"]): React.ReactNode {
  if (typeof icon !== "string") {
    return icon;
  }

  const Icon = CARD_ICON_MAP[icon] ?? FileCode2;
  return <Icon aria-hidden="true" />;
}

function Card({ icon, href, className, children, ...props }: MdxCardProps) {
  const { resolvedHref, unavailable } = resolveCardHref(href);

  return (
    <FumaCard
      icon={resolveCardIcon(icon)}
      href={resolvedHref}
      aria-disabled={unavailable || undefined}
      className={cn(
        className,
        unavailable ? "opacity-70 [&_h3]:text-muted-foreground [&_p]:text-muted-foreground" : undefined,
      )}
      {...props}
    >
      {children}
      {unavailable ? (
        <span className="mt-2 block text-xs text-muted-foreground">Content coming soon.</span>
      ) : null}
    </FumaCard>
  );
}

function MdxPre({ icon, children, ...props }: MdxPreProps) {
  const resolvedIcon = typeof icon === "string" ? <FileCode2 aria-hidden="true" /> : icon;

  return (
    <FumaCodeBlock icon={resolvedIcon} {...props}>
      <FumaPre>{children}</FumaPre>
    </FumaCodeBlock>
  );
}

function CardGroup({ cols = 2, className, ...props }: CardGroupProps) {
  const colsClass = cols === 1 ? "grid-cols-1" : cols >= 3 ? "grid-cols-3" : "grid-cols-2";
  const mergedClassName = className ? `${colsClass} ${className}` : colsClass;

  return <FumaCards className={mergedClassName} {...props} />;
}

function Info(props: React.ComponentProps<typeof Callout>) {
  return <Callout type="info" {...props} />;
}

function Warning(props: React.ComponentProps<typeof Callout>) {
  return <Callout type="warning" {...props} />;
}

function Note(props: React.ComponentProps<typeof Callout>) {
  return <Callout type="info" {...props} />;
}

function Tip(props: React.ComponentProps<typeof Callout>) {
  return <Callout type="info" {...props} />;
}

function Accordion(props: React.ComponentProps<typeof FumaAccordion>) {
  return <FumaAccordion {...props} />;
}

function AccordionGroup(props: React.ComponentProps<typeof Accordions>) {
  return <Accordions {...props} />;
}

function Steps({ children }: React.ComponentProps<typeof FumaSteps>) {
  return <FumaSteps>{children}</FumaSteps>;
}

function Step({ title, children }: StepProps) {
  return (
    <FumaStep>
      {title ? <p className="font-medium">{title}</p> : null}
      {children}
    </FumaStep>
  );
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    MediaViewer,
    ImageViewer,
    VideoViewer,
    Accordion,
    AccordionGroup,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    AccordionRoot: RadixAccordion,
    Card,
    CardGroup,
    Info,
    Note,
    Step,
    Steps,
    Tab,
    Tabs,
    Tip,
    Warning,
    Author,
    h1: createHeading(1),
    h2: createHeading(2),
    h3: createHeading(3),
    h4: createHeading(4),
    h5: createHeading(5),
    h6: createHeading(6),
    pre: MdxPre,
    ...components,
  };
}

export const useMDXComponents = getMDXComponents;
