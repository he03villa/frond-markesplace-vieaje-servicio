import { SafeUrl } from "@angular/platform-browser";

export interface SelectedFile {
    file: File;
    type: string;           // MIME real
    preview: SafeUrl | null;
    original_name: string;
    human_size: string;
}
