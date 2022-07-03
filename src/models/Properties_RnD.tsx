import Properties_Common from './Properties_Common';

class Properties_RnD extends Properties_Common {

    public DocumentType: string = "";

    public Abstract: string = "";

    public AuthorizedAssociatesId: any = { results: [] };

    public OrganizationalUnitId: any = { results: [] };

    public AdditionalApproversId: any = { results: [] };

    public NotificationUsersId: any = { results: [] };

    public CustomACLId: any = { results: [] };

    // Special properties

    public RelevantforFDLegislation: boolean = false;

    public ProjectNumber: string = "";

    public DocumentNumber: string = "";
}

export default Properties_RnD;