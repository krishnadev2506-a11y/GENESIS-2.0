import { CertificatesClient } from './CertificatesClient';

export const metadata = {
  title: 'Certificates | Admin | GENESIS 2.0',
};

export default function CertificatesPage() {
  return (
    <div className="space-y-8 relative z-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wide uppercase">
          Certificates
        </h1>
        <p className="text-text-muted font-body text-[16px]">
          Upload, manage, and dispatch participant certificates.
        </p>
      </div>

      <CertificatesClient />
    </div>
  );
}
