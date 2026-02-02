interface Props {
  modules: string[];
}

export const RoleModulesPill: React.FC<Props> = ({ modules }) => {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {modules.map((m) => (
        <span
          key={m}
          className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
        >
          {m}
        </span>
      ))}
    </div>
  );
};
