import Swal from "sweetalert2";

/** Konfirmasi SweetAlert2 sebelum aksi simpan/update/delete/aksi penting. */
export async function confirmAction(options?: {
  title?: string;
  text?: string;
  confirmText?: string;
  danger?: boolean;
}): Promise<boolean> {
  const res = await Swal.fire({
    title: options?.title ?? "Konfirmasi",
    text: options?.text ?? "Yakin ingin melanjutkan?",
    icon: options?.danger === false ? "question" : "warning",
    showCancelButton: true,
    confirmButtonText: options?.confirmText ?? (options?.danger === false ? "Ya, Simpan" : "Ya, lanjut"),
    cancelButtonText: "Batal",
    confirmButtonColor: options?.danger === false ? "#ff6529" : "#dc2626",
    cancelButtonColor: "#6b7280",
    reverseButtons: true,
    focusCancel: true,
  });
  return res.isConfirmed;
}

/** Notifikasi sukses SweetAlert2. */
export async function notifySuccess(options?: {
  title?: string;
  text?: string;
}): Promise<boolean> {
  await Swal.fire({
    icon: "success",
    title: options?.title ?? "Berhasil",
    text: options?.text,
    timer: 1800,
    showConfirmButton: false,
    toast: true,
    position: "top-end",
    timerProgressBar: true,
  });
  return true;
}

/** Notifikasi error SweetAlert2. */
export async function notifyError(options?: {
  title?: string;
  text?: string;
}): Promise<boolean> {
  await Swal.fire({
    icon: "error",
    title: options?.title ?? "Gagal",
    text: options?.text ?? "Terjadi kesalahan. Coba lagi.",
    confirmButtonColor: "#dc2626",
  });
  return true;
}
