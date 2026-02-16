export default function ButtonAddMaterial() {
  return (
    <div className="bg-[#01669f] relative rounded-[4px] shadow-[0px_1px_2px_0px_rgba(16,40,34,0.05)] size-full" data-name="Button/add-material">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[4px] items-center justify-center overflow-clip p-[8px] relative size-full">
          <div className="box-border content-stretch flex h-[16px] items-center justify-center px-[4px] py-0 relative shrink-0">
            <p className="font-['Open_Sans:SemiBold',_sans-serif] font-semibold leading-[18px] relative shrink-0 text-[12px] text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
              Add Material
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}