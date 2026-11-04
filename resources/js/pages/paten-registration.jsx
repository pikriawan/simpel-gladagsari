import "jsuites/dist/jsuites.css";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import { patenRegistration } from "@/routes";
import { Head } from "@inertiajs/react";
import { useRef } from "react";
import { Spreadsheet, Worksheet } from "@jspreadsheet-ce/react";

export default function PatenRegistration() {
    const spreadsheet = useRef();

    return (
        <>
            <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
            <Head title="Registrasi PATEN" />
            <div className="p-4">
                <div className="paten-registration-spreadsheet h-[calc(100svh-7rem)] w-full overflow-hidden">
                    <Spreadsheet ref={spreadsheet} toolbar>
                        <Worksheet minDimensions={[50, 50]} />
                    </Spreadsheet>
                </div>
            </div>
        </>
    );
}

PatenRegistration.layout = {
    breadcrumbs: [
        {
            title: 'Registrasi PATEN',
            href: patenRegistration(),
        },
    ],
};
