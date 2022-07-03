import Properties_Common from './Properties_Common';

class Properties_Paper extends Properties_Common {

    public DocumentType: string = "";

    public Abstract: string = "";

    public AdditionalApproversId: any = { results: [] };

    public NotificationUsersId: any = { results: [] };

    // Special properties

    public AttachedUrl: any = null;

    public NameOfConference: string = "";

    public LocationOfConference: string = "";

    public DateOfConference: Date | null = null;

    public NameOfJournal: string = "";

    public DateOfPublication: Date | null = null;

}

export default Properties_Paper;