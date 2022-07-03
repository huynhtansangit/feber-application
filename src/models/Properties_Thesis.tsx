import Properties_Common from './Properties_Common';

class Properties_Thesis extends Properties_Common {

    public DocumentType: string = "";

    public Abstract: string = "";

    public AuthorizedAssociatesId: any = { results: [] };

    public OrganizationalUnitId: any = { results: [] };

    public AdditionalApproversId: any = { results: [] };

    public NotificationUsersId: any = { results: [] };

    public CustomACLId: any = { results: [] };

    // Special properties - None

}

export default Properties_Thesis;