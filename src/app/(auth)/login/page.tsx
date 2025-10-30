import Image from "next/image";
import LoginForm from "@/components/forms/LoginForm";


export default function LoginPage() {
  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image
          src="/assets/images/Wandee Bakery239.jpg"
          alt="A collection of delicious pastries"
          fill
          priority
          style={{
            objectFit: "cover",
          }}
        />
      </div>

      <div className="bg-[#fffbeb] flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8 text-center lg:text-left">
            <Image
              src="/assets/images/Bee_Choice_PNG_02.png" // 
              alt="Company Logo"
              width={80} 
              height={80}
            />
            <h1 className="text-3xl font-bold text-gray-800">ระบบจัดการคลังสินค้า</h1>
            <p className="mt-2 text-gray-500">กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
