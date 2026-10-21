export function SdkLoadingSkeleton() {
  return (
    <section
      className="flex flex-col items-center gap-4 px-6 py-8"
      role="region"
      aria-label="加载中"
      aria-busy="true"
    >
      {/* 手机号骨架 */}
      <div className="h-7 w-40 animate-pulse rounded-md bg-[#eef0f3]" />
      {/* tips 骨架 */}
      <div className="h-4 w-48 animate-pulse rounded-md bg-[#f1f3f5]" />
      {/* 状态长描述骨架 (3 行) */}
      <div className="w-full space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-[#f3f5f7]" />
        <div className="h-3 w-11/12 animate-pulse rounded bg-[#f3f5f7]" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-[#f3f5f7]" />
      </div>
      {/* 4 格输入骨架 */}
      <div className="mt-3 grid w-full max-w-[300px] grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[64px] animate-pulse rounded-2xl bg-[#f6f7f7]" />
        ))}
      </div>
      {/* 按钮骨架 */}
      <div className="mt-6 h-[52px] w-full animate-pulse rounded-[10px] bg-[#eef0f3]" />
    </section>
  )
}
