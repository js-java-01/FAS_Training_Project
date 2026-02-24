import React, { createContext, useContext, useState } from "react";

interface RoleSwitchContextType {
  viewRole: string | null;
  setViewRole: (role: string | null) => void;
}

const RoleSwitchContext = createContext<RoleSwitchContextType | undefined>(
  undefined,
);

export const RoleSwitchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [viewRole, setViewRole] = useState<string | null>(null);

  return (
    <RoleSwitchContext.Provider value={{ viewRole, setViewRole }}>
      {children}
    </RoleSwitchContext.Provider>
  );
};

export const useRoleSwitch = () => {
  const ctx = useContext(RoleSwitchContext);
  if (!ctx) throw new Error("useRoleSwitch must be used inside provider");
  return ctx;
};
