import RootPage from "@/components/root-page/RootPage";
import OvertimeRegister from "@/page/overtime/OvertimeRegister";

export default function page() {
    return (
        <RootPage protect>
            <OvertimeRegister />
        </RootPage>
    );
}
