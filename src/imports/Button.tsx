export default function Button() {
  return (
    <div className="bg-[#14171a] relative rounded-[4px] size-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#6e757c] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[6px] items-center justify-center px-[13px] py-px relative size-full">
          <p className="font-['Open_Sans:Regular',_sans-serif] font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
            Cancel
          </p>
        </div>
      </div>
    </div>
  );
}