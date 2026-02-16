function Wrapper() {
  return (
    <div className="box-border content-stretch flex h-[16px] items-center justify-center px-[4px] py-0 relative shrink-0" data-name="wrapper">
      <p className="font-['Open_Sans:SemiBold',_sans-serif] font-semibold leading-[18px] relative shrink-0 text-[12px] text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Add Action
      </p>
    </div>
  );
}

export default function ButtonXs() {
  return (
    <div className="relative rounded-[4px] size-full" data-name="Button/xs">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[4px] items-center justify-center overflow-clip p-[8px] relative size-full">
          <Wrapper />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#6e757c] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_1px_2px_0px_rgba(16,40,34,0.05)]" />
    </div>
  );
}