// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import type { Liff } from '@line/liff';
import type { Profile } from '@liff/get-profile';

export default function HomePage() {
  // State สำหรับเก็บข้อมูลโปรไฟล์ผู้ใช้
  const [profile, setProfile] = useState<Profile | null>(null);
  // State สำหรับจัดการสถานะการโหลด
  const [loading, setLoading] = useState<boolean>(true);
  // State สำหรับเก็บข้อความ Error
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ฟังก์ชันหลักสำหรับ Initialize LIFF
    const main = async () => {
      try {
        // Import liff SDK แบบ dynamic
        const liff: Liff = (await import('@line/liff')).default;
        
        // เริ่มการทำงานของ LIFF SDK
        // โดยดึง LIFF ID มาจาก Environment Variables
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });

        // ตรวจสอบว่าผู้ใช้ล็อกอินเข้าสู่ระบบ LINE แล้วหรือยัง
        if (liff.isLoggedIn()) {
          // ถ้าล็อกอินแล้ว ให้ดึงข้อมูลโปรไฟล์
          const userProfile = await liff.getProfile();
          setProfile(userProfile);
        } else {
          // ถ้ายังไม่ล็อกอิน ให้ redirect ไปหน้าล็อกอินของ LINE
          // หมายเหตุ: โดยปกติ LIFF จะจัดการเรื่องนี้ให้เองเมื่อเปิดใน LINE
          // แต่การเรียก liff.login() จะเป็นการบังคับให้ล็อกอินทันที
          // liff.login(); 
        }
      } catch (e: unknown) {
        // จัดการ Error ที่อาจเกิดขึ้น
        console.error(e);
        if (e instanceof Error) {
          setError(`เกิดข้อผิดพลาดในการเริ่มต้น LIFF: ${e.message}`);
        } else {
          setError("เกิดข้อผิดพลาดที่ไม่รู้จัก");
        }
      } finally {
        // เมื่อการทำงานเสร็จสิ้น (ไม่ว่าจะสำเร็จหรือล้มเหลว) ให้หยุดการโหลด
        setLoading(false);
      }
    };

    main();
  }, []); // [] หมายถึงให้ useEffect นี้ทำงานแค่ครั้งเดียวตอน component ถูกสร้าง

  // ส่วนของการแสดงผล (Render)
  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* แสดงข้อความ Loading... ระหว่างรอ */}
      {loading && <p>Loading...</p>}

      {/* แสดงข้อความ Error ถ้ามี */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* แสดงข้อมูลโปรไฟล์เมื่อโหลดสำเร็จ และไม่เกิด Error */}
      {!loading && !error && profile && (
        <div style={{ textAlign: 'center' }}>
          {profile.pictureUrl && (
            <img
              src={profile.pictureUrl}
              alt="Profile Picture"
              style={{ width: 100, height: 100, borderRadius: '50%' }}
            />
          )}
          <h1>Hello, {profile.displayName}!</h1>
          <p style={{ color: '#666' }}>Welcome to your first LIFF App with Next.js</p>
        </div>
      )}

      {/* แสดงข้อความให้ล็อกอิน หากยังไม่ได้ล็อกอิน */}
      {!loading && !error && !profile && (
         <p>Please log in to continue.</p>
      )}
    </main>
  );
}

