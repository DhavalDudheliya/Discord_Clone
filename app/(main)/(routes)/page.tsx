import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@clerk/nextjs";

const page = () => {
  return (
    <div>
      Dhaval DUdheliya
      <UserButton />
      <ModeToggle />
    </div>
  );
};

export default page;
