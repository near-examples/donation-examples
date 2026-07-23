import Image from "next/image";
import Link from "next/link";
import { useNearWallet } from "near-connect-hooks";

export const Navigation = () => {
  const { signedAccountId, signIn, signOut, loading } = useNearWallet();

  return (
    <nav className="navbar bg-white border-bottom">
      <div className="container">
        <Link
          href="/"
          className="navbar-brand d-flex align-items-center gap-2 fw-semibold"
        >
          <Image priority src="/near-logo.svg" alt="NEAR" width={30} height={24} />
          Donations
        </Link>
        {signedAccountId ? (
          <div className="d-flex align-items-center gap-3">
            <span className="text-secondary small d-none d-sm-inline font-monospace">
              {signedAccountId}
            </span>
            <button className="btn btn-outline-dark btn-sm" onClick={signOut}>
              Log out
            </button>
          </div>
        ) : (
          <button
            className="btn btn-dark"
            onClick={() => signIn()}
            disabled={loading}
          >
            {loading ? "Loading..." : "Connect wallet"}
          </button>
        )}
      </div>
    </nav>
  );
};
