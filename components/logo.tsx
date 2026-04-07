type Props = {
  size?: number;
  withText?: boolean;
  textSize?: 'sm' | 'md' | 'lg';
};

export function Logo({ size = 36, withText = true, textSize = 'md' }: Props) {
  const barWidth = (size / 36) * 4;
  const gap = (size / 36) * 2;
  const barH1 = (size / 36) * 8;
  const barH2 = (size / 36) * 12;
  const barH3 = (size / 36) * 16;

  const textClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  }[textSize];

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center justify-center rounded-[10px]"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(160deg, #3C9FFE, #0274DF)',
        }}
      >
        <div className="flex items-end" style={{ gap }}>
          <div
            className="bg-white rounded-[1px]"
            style={{ width: barWidth, height: barH1 }}
          />
          <div
            className="bg-white rounded-[1px]"
            style={{ width: barWidth, height: barH2 }}
          />
          <div
            className="bg-white rounded-[1px]"
            style={{ width: barWidth, height: barH3 }}
          />
        </div>
      </div>
      {withText && (
        <span className={`${textClasses} font-bold text-text tracking-tight`}>
          Hesabaty Business
        </span>
      )}
    </div>
  );
}
