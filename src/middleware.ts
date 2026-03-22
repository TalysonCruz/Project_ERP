// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { jwtVerify } from "jose";

// const JWT_SECRET = process.env.JWT_SECRET!;
// if (!JWT_SECRET) throw new Error("JWT_SECRET não definido no .env.local");

// function authorize(pathname: string, role: string) {
//   if (pathname.startsWith("/admin") && role !== "ADMIN") return false;
//   if (pathname.startsWith("/manager") && !["ADMIN", "MANAGER"].includes(role))
//     return false;
//   if (
//     pathname.startsWith("/vendedor") &&
//     !["ADMIN", "MANAGER", "VENDEDOR"].includes(role)
//   )
//     return false;
//   return true;
// }

// function getCookie(req: NextRequest, name: string) {
//   const cookieHeader = req.headers.get("cookie") || "";
//   if (!cookieHeader) return undefined;

//   const cookies = new Map<string, string>();

//   cookieHeader.split(";").forEach((cookie) => {
//     const trimmedCookie = cookie.trim();
//     const equalIndex = trimmedCookie.indexOf("=");
//     if (equalIndex > 0) {
//       const key = trimmedCookie.substring(0, equalIndex);
//       const value = trimmedCookie.substring(equalIndex + 1);
//       cookies.set(key, value);
//     }
//   });

//   return cookies.get(name);
// }

// export async function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   // Só proteger rotas específicas
//   if (
//     pathname.startsWith("/admin") ||
//     pathname.startsWith("/manager") ||
//     pathname.startsWith("/vendedor") ||
//     pathname.startsWith("/api/admin") ||
//     pathname.startsWith("/api/manager") ||
//     pathname.startsWith("/api/vendedor")
//   ) {
//     const token = getCookie(req, "token");
//     if (!token) {
//       if (pathname.startsWith("/api")) {
//         return NextResponse.json({ message: "Token não fornecido!" }, { status: 401 });
//       }
//       return NextResponse.redirect(new URL("/", req.url));
//     }

//     try {
//       const secret = new TextEncoder().encode(JWT_SECRET);
//       const { payload } = await jwtVerify(token, secret);

//       if (!authorize(pathname, payload.role as string)) {
//         if (pathname.startsWith("/api")) {
//           return NextResponse.json(
//             { message: "Acesso negado! Permissão insuficiente." },
//             { status: 403 }
//           );
//         }
//         return NextResponse.redirect(new URL("/", req.url));
//       }
//     } catch (error) {
//       if (pathname.startsWith("/api")) {
//         return NextResponse.json({ message: "Token inválido!" }, { status: 401 });
//       }
//       return NextResponse.redirect(new URL("/", req.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/admin/:path*",
//     "/manager/:path*",
//     "/vendedor/:path*",
//     "/api/admin/:path*",
//     "/api/manager/:path*",
//     "/api/vendedor/:path*",
//   ],
// };
