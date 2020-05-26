export interface MessageI
{
    vessel: String;
    time? : String;
    date?: String;
    lat?: String;
    longi?: String;
    course?: String;
    speed?: String;
    crew?: String;
    fuel?: String;
    oil?: String;
    water?: String;
    prev_bunker?: String;
    bunker?: String;
    temp?: String;
    wind?: String;
    wind_direct?: String;
    wave?: String;
    iceset?: String;
    project?: String;
    datestart?: String;
    dateend?: String;
    vstatus?: String;
    comment?: String;
}

export interface ShipI
{
    name: String;
    name_en : String;
    icon: String;
}

export interface ProjectI
{
    name: String;
    name_en : String;
    date_start: String;
    date_end: String;
}