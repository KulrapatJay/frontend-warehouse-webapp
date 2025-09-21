"use client";

import { useEffect, useRef, useState } from "react";

type ConfirmDeleteModalProps = {
  open: boolean;
  userLabel?: string;            
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export default function ConfirmDeleteModal({
  open,
  userLabel,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => cancelBtnRef.current?.focus(), 0);
    } else {
      setLoading(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className={`modal ${open ? "modal-open" : ""}`} role="dialog" aria-modal="true">
      <div className="modal-box bg-base-100 text-base-content">
        <h3 className="text-lg font-bold">ยืนยันการลบ</h3>
        <p className="py-2">
          คุณต้องการลบผู้ใช้นี้หรือไม่{userLabel ? <>: <span className="font-semibold">{userLabel}</span></> : "?"}
        </p>

        {/* คำเตือน */}
        <div className="mt-2 border border-error/30 bg-error/10 text-error rounded-md p-3 text-sm">
          การลบเป็นการกระทำถาวร ไม่สามารถกู้คืนได้
        </div>

        <div className="modal-action">
          <button
            ref={cancelBtnRef}
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button
            className={`btn btn-error text-white ${loading ? "btn-disabled" : ""}`}
            onClick={handleConfirm}
          >
            {loading ? <span className="loading loading-spinner" /> : "ยืนยันลบ"}
          </button>
        </div>
      </div>

      {/* คลิกฉากหลังเพื่อปิด */}
      <button className="modal-backdrop" onClick={onClose} aria-label="Close" />
    </div>
  );
}