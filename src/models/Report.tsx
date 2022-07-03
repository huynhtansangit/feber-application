import Properties_LL from './Properties_LL';
import Properties_RnD from './Properties_RnD';
import Properties_Thesis from './Properties_Thesis';
import Properties_Paper from './Properties_Paper';

class Report {

    constructor() {
        this.Attachment = null;
        this.UploadTypeDraw = null;
        this.UploadType = "";
        this.UploadTypeDescription = "";
        this.LLProperties = new Properties_LL();
        this.RnDProperties = new Properties_RnD();
        this.ThesisProperties = new Properties_Thesis();
        this.PaperProperties = new Properties_Paper();
    }

    public Attachment: any;

    public UploadTypeDraw: any;

    public UploadType: string;

    public UploadTypeDescription: string;

    public LLProperties: Properties_LL;

    public RnDProperties: Properties_RnD;

    public ThesisProperties: Properties_Thesis;

    public PaperProperties: Properties_Paper;

}

export default Report;