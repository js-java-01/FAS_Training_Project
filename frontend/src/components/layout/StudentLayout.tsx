import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store";
import { setLogout } from "@/store/slices/auth/authSlice";
import {
  BookOpen,
  Calendar,
  Home,
  ChevronDown,
  GraduationCap,
  Bell,
  LogOut,
  User,
  Globe,
  Layers,
  MessageSquare,
} from "lucide-react";

// ─── Navbar ───────────────────────────────────────────────────────────────────
function StudentNavbar({ active }: { active?: string }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { firstName, email } = useSelector((state: RootState) => state.auth);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCoursesMenu, setShowCoursesMenu] = useState(false);

  const handleLogout = () => {
    dispatch(setLogout());
    navigate("/login");
  };

  const navLink = (to: string, label: string, Icon: React.ElementType) => {
    const isActive = active === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? "text-blue-800 bg-blue-50"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        <Icon className="w-4 h-4" />
        {label}
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 border-r-2 border-gray-200 pr-4">
              <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <p className="text-[10px] font-semibold text-blue-800 uppercase tracking-wider">
                  FPT
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  Education
                </p>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLink("/student-home", "Home", Home)}
            {navLink("/student-calendar", "Calendar", Calendar)}
            {navLink("/student-my-courses", "My Courses", BookOpen)}

            <div className="relative">
              <button
                onMouseEnter={() => setShowCoursesMenu(true)}
                onMouseLeave={() => setShowCoursesMenu(false)}
                className="flex items-center gap-1.5 px-2 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Layers className="w-4 h-4" />
                All Courses
                <ChevronDown className="w-3 h-3" />
              </button>
              {showCoursesMenu && (
                <div
                  onMouseEnter={() => setShowCoursesMenu(true)}
                  onMouseLeave={() => setShowCoursesMenu(false)}
                  className="absolute top-full left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 mt-0.5"
                >
                  <Link
                    to="/courses"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    Browse Courses
                  </Link>
                  <Link
                    to="/student-my-courses"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Online Courses
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-700 rounded-full" />
            </button>
            <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
              <MessageSquare className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowDropdown((v) => !v)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-blue-800 flex items-center justify-center text-white text-xs font-bold">
                  {(firstName?.[0] || email?.[0] || "S").toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-25 truncate">
                  {firstName || email}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </button>
              {showDropdown && (
                <div className="absolute top-full right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {firstName || email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function StudentFooter() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 text-gray-600 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-800 font-bold text-sm">
                FPT University LMS
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Hệ thống quản lý học tập — Trường Đại học FPT.
            </p>
          </div>
          <div>
            <h5 className="text-gray-700 text-sm font-semibold mb-3">
              Liên kết nhanh
            </h5>
            <ul className="space-y-1.5 text-xs">
              {[
                { label: "Trang chủ", to: "/student-home" },
                { label: "Khóa học của tôi", to: "/student-my-courses" },
                { label: "Lịch học", to: "/student-calendar" },
                { label: "Cài đặt MFA", to: "/mfa-setting" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-gray-500 hover:text-blue-700 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-gray-700 text-sm font-semibold mb-3">Hỗ trợ</h5>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li>📧 support@fpt.edu.vn</li>
              <li>📞 1900 6836</li>
              <li>🏫 Trường ĐH FPT, Hà Nội</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} FPT University. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// ─── Layout wrapper ───────────────────────────────────────────────────────────
export function StudentLayout({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: string;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <StudentNavbar active={active} />
      <main className="flex-1">{children}</main>
      <StudentFooter />
    </div>
  );
}
