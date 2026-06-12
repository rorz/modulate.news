import Image from "next/image";

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <Image
        alt="Modulate"
        className="h-7 w-auto"
        height={88}
        priority
        src="/modulate-wordmark.svg"
        width={475}
      />
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto min-h-screen w-full max-w-5xl px-4 sm:px-6">{children}</div>;
}
