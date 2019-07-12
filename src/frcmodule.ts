export function getTextPid(txt: string, use_level_comma: boolean) {
    let pid = 0;
    let c_level = 0;
    for (let i = 0; i < txt.length; i++) {
        if (txt[i] === '\\') {
            i++;
        } else if (use_level_comma && txt[i] === '(') {
            c_level++;
        } else if (use_level_comma && txt[i] === ')' && c_level > 0) {
            c_level--;
        } else if (c_level === 0 && txt[i] === ',') {
            pid++;
        }
    }
    return pid;
}
export function getRangeOfPid(txt: string, pid: number, use_level_comma: boolean) {
    let beg = 0, end = 0;
    let cpid = 0;
    if (txt[0] === '#') {
        //pop comment
        return null;
    }

    let hc_level = 0;

    if (pid > 0) {
        for (beg = 0; beg < txt.length; beg++) {
            if (txt[beg] === '\\') {
                beg++;
            } else if (use_level_comma && txt[beg] === '(') {
                hc_level++;
            } else if (use_level_comma && txt[beg] === ')' && hc_level > 0) {
                hc_level--;
            } else if (hc_level === 0 && txt[beg] === ',') {
                cpid++;
                if (cpid === pid) {
                    beg++;
                    break;
                }
            }
        }
    }
    hc_level = 0;
    if (cpid === pid) {
        for (end = beg; end < txt.length; end++) {
            if (txt[end] === '\\') {
                end++;
            } else if (use_level_comma && txt[end] === '(') {
                hc_level++;
            } else if (use_level_comma && txt[end] === ')' && hc_level > 0) {
                hc_level--;
            } else if (hc_level === 0 && txt[end] === ',') {
                break;
            }
        }
        /*
        if (txt[end] === ',') {
            end++;
        }
        */
        return [beg,end];
    }
    return null;
}
export function makeTextOfLine(data:{pid:number,text:string}[]){
    let ret = "";
    let cur = 0;
    data.sort((a,b)=>a.pid - b.pid).forEach(s=>{
        while(cur < s.pid){
            cur++;
            ret += ',';
        }
        ret += s.text;
    });
    return ret;
}