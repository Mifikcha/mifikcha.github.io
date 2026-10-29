var me=()=>({completed:[],drafts:{}}),X=(e,t)=>{let r=e.findIndex(o=>!t.includes(o.id));return r<0?e.length-1:r},Y=(e,t,r)=>r>=0&&r<e.length&&e.slice(0,r).every(o=>t.includes(o.id)),he=(e,t,r)=>{if(!Y(e,t.completed,r))return t;let o=e[r].id;return t.completed.includes(o)?t:{...t,completed:[...t.completed,o]}},ge=e=>`hopes-coding-tasks-v1:${e}`,fe=(e,t)=>{try{let r=JSON.parse(t.getItem(ge(e))??"null");return!r||!Array.isArray(r.completed)||typeof r.drafts!="object"||!r.drafts?me():{completed:r.completed.filter(o=>typeof o=="string"),drafts:Object.fromEntries(Object.entries(r.drafts).filter(o=>typeof o[1]=="string"))}}catch{return me()}},J=(e,t,r)=>{try{r.setItem(ge(e),JSON.stringify(t))}catch{}};var Se="https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js",Le=`def solve(x):
    return x * x

print(solve(5))`,Te=`
import ast
import contextlib
import io
import json
import re
import traceback

stdout = io.StringIO()
stderr = io.StringIO()
namespace = {"__name__": "__main__"}
tests = [line.strip() for line in (USER_TESTS or "").splitlines() if line.strip()]
passed = []
failed = []
code_ok = True
error_line = None

def short_repr(value, limit=240):
    rendered = repr(value)
    return rendered if len(rendered) <= limit else rendered[:limit - 1] + "\u2026"

def source_line_for_call(expression):
    calls = [node for node in ast.walk(expression) if isinstance(node, ast.Call)]
    names = [node.func.id for node in calls if isinstance(node.func, ast.Name)]
    for line_number, line in enumerate(USER_CODE.splitlines(), 1):
        if any(re.match(rf"\\s*def\\s+{re.escape(name)}\\s*\\(", line) for name in names):
            return line_number
    return None

def inspect_test(test, index):
    detail = {
        "index": index,
        "code": test,
        "check": test.removeprefix("assert ").strip(),
        "input": "",
        "expected": "True",
        "actual": "",
        "message": "",
        "line": None,
    }
    tree = ast.parse(test, mode="exec")
    statement = tree.body[0] if len(tree.body) == 1 else None
    if not isinstance(statement, ast.Assert):
        exec(compile(tree, "<test>", "exec"), namespace)
        detail["actual"] = "\u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043E"
        return True, detail

    expression = statement.test
    detail["check"] = ast.unparse(expression)
    detail["line"] = source_line_for_call(expression)
    calls = [ast.unparse(node) for node in ast.walk(expression) if isinstance(node, ast.Call)]
    detail["input"] = ", ".join(dict.fromkeys(calls))

    if (
        isinstance(expression, ast.Compare)
        and len(expression.ops) == 1
        and len(expression.comparators) == 1
        and isinstance(expression.ops[0], (ast.Eq, ast.Is))
    ):
        actual = eval(compile(ast.Expression(expression.left), "<test>", "eval"), namespace)
        expected = eval(
            compile(ast.Expression(expression.comparators[0]), "<test>", "eval"), namespace
        )
        detail["input"] = ast.unparse(expression.left)
        detail["actual"] = short_repr(actual)
        detail["expected"] = short_repr(expected)
        return actual == expected, detail

    actual = bool(eval(compile(ast.Expression(expression), "<test>", "eval"), namespace))
    detail["actual"] = short_repr(actual)
    return actual, detail

try:
    with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
        exec(compile(USER_CODE, "<\u0443\u0447\u0435\u043D\u0438\u043A>", "exec"), namespace)
except Exception as exc:
    code_ok = False
    if isinstance(exc, SyntaxError):
        error_line = exc.lineno
    frames = traceback.extract_tb(exc.__traceback__)
    student_frames = [frame for frame in frames if frame.filename == "<\u0443\u0447\u0435\u043D\u0438\u043A>"]
    if student_frames:
        error_line = student_frames[-1].lineno
    traceback.print_exc(file=stderr)

namespace["__source__"] = USER_CODE
namespace["__output__"] = stdout.getvalue()
namespace["__stderr__"] = stderr.getvalue()

if code_ok and tests:
    for index, test in enumerate(tests, 1):
        detail = {
            "index": index, "code": test, "check": test.removeprefix("assert ").strip(),
            "input": "", "expected": "True", "actual": "\u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0432\u044B\u0447\u0438\u0441\u043B\u0438\u0442\u044C", "line": None,
        }
        try:
            with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
                ok, detail = inspect_test(test, index)
            if ok:
                passed.append(detail)
            else:
                detail["message"] = "\u041F\u043E\u043B\u0443\u0447\u0435\u043D\u043E \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435, \u043D\u0435 \u0441\u043E\u0432\u043F\u0430\u0434\u0430\u044E\u0449\u0435\u0435 \u0441 \u043E\u0436\u0438\u0434\u0430\u0435\u043C\u044B\u043C."
                failed.append(detail)
        except Exception as exc:
            detail["message"] = f"{exc.__class__.__name__}: {exc}"
            failed.append(detail)

json.dumps({
    "stdout": namespace["__output__"],
    "stderr": namespace["__stderr__"],
    "passed": passed,
    "failed": failed,
    "codeOk": code_ok,
    "errorLine": error_line,
}, ensure_ascii=False)
`,Ce=`
let runtimePromise;
const runner = ${JSON.stringify(Te)};

function loadRuntime() {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      importScripts(${JSON.stringify(Se)});
      return await loadPyodide();
    })();
  }
  return runtimePromise;
}

self.onmessage = async (event) => {
  const { id, code, tests } = event.data;
  try {
    const pyodide = await loadRuntime();
    self.postMessage({ id, phase: "ready" });
    pyodide.globals.set("USER_CODE", code);
    pyodide.globals.set("USER_TESTS", tests);
    const result = await pyodide.runPythonAsync(runner);
    self.postMessage({ id, ok: true, result: JSON.parse(result) });
  } catch (error) {
    self.postMessage({
      id,
      ok: false,
      error: String(error && error.stack ? error.stack : error),
    });
  }
};
`,R,U,_e=1,Ae=()=>{if(R)return R;let e=new Blob([Ce],{type:"text/javascript"});return U=URL.createObjectURL(e),R=new Worker(U),R},Q=()=>{R?.terminate(),R=void 0,U&&URL.revokeObjectURL(U),U=void 0},Me=(e,t,r)=>{let o=Ae(),g=_e++;return new Promise((f,n)=>{let l=window.setTimeout(()=>{o.removeEventListener("message",a),Q(),n(new Error("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C Python \u0437\u0430 60 \u0441. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0441\u043D\u043E\u0432\u0430."))},6e4);function a(c){if(c.data.id===g){if("phase"in c.data){window.clearTimeout(l),l=window.setTimeout(()=>{o.removeEventListener("message",a),Q(),n(new Error(`\u041A\u043E\u0434 \u0432\u044B\u043F\u043E\u043B\u043D\u044F\u043B\u0441\u044F \u0434\u043E\u043B\u044C\u0448\u0435 ${Math.round(r/1e3)} \u0441. \u0412\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043E.`))},r);return}window.clearTimeout(l),o.removeEventListener("message",a),c.data.ok?f(c.data.result):n(new Error(c.data.error))}}o.addEventListener("message",a),o.postMessage({id:g,code:e,tests:t})})},Re=new Set(["and","as","assert","async","await","break","class","continue","def","del","elif","else","except","finally","for","from","global","if","import","in","is","lambda","nonlocal","not","or","pass","raise","return","try","while","with","yield","match","case"]),Pe=new Set(["abs","all","any","bool","dict","enumerate","filter","float","input","int","len","list","map","max","min","open","print","range","reversed","round","set","sorted","str","sum","tuple","type","zip"]),He=new Set(["True","False","None","NotImplemented","Ellipsis"]),ee=e=>e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"),B=(e,t)=>`<span class="python-token-${e}" style="display:inline!important">${ee(t)}</span>`,Ne=e=>{let t="",r=0;for(;r<e.length;){let o=e.slice(r),g=e[r];if(g==="#"){let l=e.indexOf(`
`,r),a=e.slice(r,l===-1?e.length:l);t+=B("comment",a),r+=a.length;continue}if(g==='"'||g==="'"){let a=e.slice(r,r+3)===g.repeat(3)?g.repeat(3):g,c=r+a.length;for(;c<e.length;){if(e[c]==="\\"){c+=2;continue}if(e.slice(c,c+a.length)===a){c+=a.length;break}c++}t+=B("string",e.slice(r,c)),r=c;continue}let f=o.match(/^(?:0[xX][\da-fA-F]+|0[bB][01]+|0[oO][0-7]+|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)/)?.[0];if(f){t+=B("number",f),r+=f.length;continue}let n=o.match(/^[A-Za-z_]\w*/)?.[0];if(n){let l=Re.has(n)?"keyword":Pe.has(n)?"builtin":He.has(n)?"constant":"plain";t+=l==="plain"?ee(n):B(l,n),r+=n.length;continue}/[+\-*/%=<>!&|^~:@]/.test(g)?t+=B("operator",g):t+=ee(g),r++}return`${t}
`},$e=e=>{if(e.dataset.code)return e.dataset.code;let t=e.querySelector("textarea")??e.querySelector(".python-checker-code, pre code, code");return t?.value||t?.textContent?.trim()||Le},s=(e,t,r)=>{let o=document.createElement(e);return t&&(o.className=t),r&&(o.textContent=r),o},ye=e=>{let t=document.createElementNS("http://www.w3.org/2000/svg","svg");t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("aria-hidden","true");let r=document.createElementNS("http://www.w3.org/2000/svg","path");return r.setAttribute("d",e),t.append(r),t},Oe=e=>{let t=e.replace(/^assert\s+/,"").trim(),r=t.match(/^(.+?)\s*==\s*(.+)$/);return r?{check:r[1].trim(),expected:r[2].trim()}:{check:t,expected:"True"}},Z=(e,t,r=!1)=>{e.innerHTML="";let o=t.split(`
`).map(g=>g.trim()).filter(Boolean);if(o.length===0){e.append(s("div","python-output-empty","\u0412\u044B\u0432\u043E\u0434 \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C."));return}if(r){e.append(s("div","python-output-label","\u0421\u041A\u0420\u042B\u0422\u042B\u0415 \u041F\u0420\u041E\u0412\u0415\u0420\u041A\u0418"),s("div","python-output-empty",`\u041F\u043E\u0441\u043B\u0435 \u0437\u0430\u043F\u0443\u0441\u043A\u0430 \u0431\u0443\u0434\u0435\u0442 \u0432\u0438\u0434\u043D\u043E, \u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043F\u0440\u043E\u0432\u0435\u0440\u043E\u043A \u043F\u0440\u043E\u0448\u043B\u043E: ${o.length}.`));return}e.append(s("div","python-output-label","\u041F\u0420\u041E\u0412\u0415\u0420\u041A\u0418 \u0414\u041E \u0417\u0410\u041F\u0423\u0421\u041A\u0410")),o.forEach((g,f)=>{let{check:n,expected:l}=Oe(g),a=s("div","python-test-plan");a.append(s("span","python-test-index",String(f+1).padStart(2,"0")),s("code","python-test-check",n),s("span","python-test-expect",`\u043E\u0436\u0438\u0434\u0430\u0435\u0442\u0441\u044F ${l}`)),e.append(a)})},te=(e,t,r)=>{if(!r.trim())return;let o=s("section","python-output-block"),g=s("pre","python-output-value");r.trimEnd().split(`
`).forEach((f,n)=>{let l=s("span","python-output-line",f);l.style.animationDelay=`${Math.min(n*34,340)}ms`,g.append(l)}),o.append(s("div","python-output-label",t),g),e.append(o)},Ie=(e,t,r=!1)=>{e.innerHTML="",te(e,"PROGRAM OUTPUT",t.stdout),te(e,"PYTHON ERROR",t.stderr);let o=t.passed.length+t.failed.length;if(o>0){let g=s("section","python-test-summary"),f=s("div","python-test-summary-line");f.append(s("strong",void 0,`${t.passed.length} / ${o} TESTS PASSED`),s("span",void 0,t.failed.length?"FAILED":"DONE"));let n=s("span","python-test-progress");if(n.style.setProperty("--python-test-progress",`${t.passed.length/o*100}%`),g.append(f,n),e.append(g),r)return;for(let l of[...t.failed,...t.passed]){let a=s("section",`python-test-result ${t.failed.includes(l)?"is-failed":"is-passed"}`);a.append(s("strong","python-test-result-title",`TEST ${l.index} \xB7 ${t.failed.includes(l)?"FAILED":"PASSED"}`),s("code","python-test-result-check",l.check)),l.input&&a.append(s("div",void 0,`\u041F\u043E\u0434\u0441\u0442\u0430\u0432\u043B\u044F\u0435\u0442\u0441\u044F: ${l.input}`)),a.append(s("div",void 0,`\u041E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C: ${l.expected}`),s("div",void 0,`\u041F\u043E\u043B\u0443\u0447\u0435\u043D\u043E: ${l.actual}`)),l.message&&a.append(s("div","python-test-message",l.message)),e.append(a)}}e.childElementCount===0&&e.append(s("div","python-output-empty","\u041A\u043E\u0434 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D \u0431\u0435\u0437 \u0432\u044B\u0432\u043E\u0434\u0430."))},De=e=>{if(e.dataset.pythonReady==="true")return;e.dataset.pythonReady="true";let t=$e(e),r=e.dataset.tests??"",o=e.dataset.hiddenTests==="true",g=Number(e.dataset.timeout??8e3),f=e.dataset.layout==="lesson",n=[];try{let i=JSON.parse(e.dataset.tasks??"[]");Array.isArray(i)&&i.length>1&&i.every(p=>p&&typeof p.id=="string"&&typeof p.prompt=="string"&&typeof p.starterCode=="string"&&typeof p.tests=="string"&&p.tests.trim().length>0)&&(n=i)}catch{}let l=e.dataset.lesson??"",a=fe(l,localStorage),c=n.length?X(n,a.completed):0;e.innerHTML="";let P=s("div","python-checker-header"),H=s("div","python-checker-title"),be=s("span","python-language-dot"),ve=s("strong",void 0,e.dataset.title??"\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 Python"),C=s("span","python-line-count");H.append(be,ve,C);let ne=s("div","python-checker-controls"),_=s("button","python-checker-run");_.type="button";let se=ye("m5 3 14 9-14 9V3z"),xe=se.querySelector("path");_.append(se,s("span",void 0,"\u0417\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C"));let A=s("button","python-checker-reset");A.type="button",A.title="\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u043A\u043E\u0434",A.setAttribute("aria-label","\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u043A\u043E\u0434"),A.append(ye("M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5")),ne.append(_,A),P.append(H,ne);let q=e.dataset.task||n.length?s("div","python-checker-task",e.dataset.task):void 0,F=n.length?s("small","python-task-label"):void 0,z=n.length?s("span","python-task-prompt"):void 0,T=n.length?s("details","python-task-hint"):void 0;q&&F&&z&&T&&q.replaceChildren(F,z,T);let v=n.length?s("nav","python-task-rail"):void 0;v&&v.setAttribute("aria-label","\u0417\u0430\u0434\u0430\u0447\u0438 \u0443\u0440\u043E\u043A\u0430");let N=s("div","python-editor-shell"),K=s("div","python-line-numbers-viewport");K.setAttribute("aria-hidden","true");let V=s("div","python-line-numbers");K.append(V);let re=s("div","python-editor-stack"),ie=s("div","python-active-line"),$=s("div","python-error-line");$.hidden=!0;let O=s("pre","python-checker-highlight");O.setAttribute("aria-hidden","true");let oe=s("code");O.append(oe);let d=s("textarea","python-checker-editor");d.value=t,d.spellcheck=!1,d.autocomplete="off",d.setAttribute("autocapitalize","off"),d.setAttribute("aria-label","Python-\u043A\u043E\u0434"),re.append(ie,$,O,d),N.append(K,re);let I=s("section","python-console"),x=f?s("div","python-console-splitter"):void 0;x&&(x.setAttribute("role","separator"),x.setAttribute("aria-label","\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0432\u044B\u0441\u043E\u0442\u0443 \u0440\u0435\u0434\u0430\u043A\u0442\u043E\u0440\u0430 \u0438 \u043A\u043E\u043D\u0441\u043E\u043B\u0438"),x.setAttribute("aria-orientation","horizontal"),x.setAttribute("aria-valuemin","35"),x.setAttribute("aria-valuemax","78"),x.setAttribute("aria-valuenow","67"),x.tabIndex=0,x.append(s("span")));let ae=s("div","python-console-header"),Ee=s("strong",void 0,"STDOUT"),M=s("span","python-checker-status","READY");ae.append(Ee,M);let w=s("div","python-checker-output");w.setAttribute("aria-live","polite"),I.append(ae,w);let G,ke=()=>{let i=getComputedStyle(d);return{lineHeight:Number.parseFloat(i.lineHeight),paddingTop:Number.parseFloat(i.paddingTop)}},S=()=>{oe.innerHTML=Ne(d.value);let i=Math.max(1,d.value.split(`
`).length);V.textContent=Array.from({length:i},(E,m)=>String(m+1)).join(`
`);let p=`${i} LOC`;C.textContent&&C.textContent!==p&&(C.classList.remove("is-updated"),C.offsetWidth,C.classList.add("is-updated")),C.textContent=p,O.scrollTop=d.scrollTop,O.scrollLeft=d.scrollLeft,V.style.transform=`translateY(${-d.scrollTop}px)`;let{lineHeight:y,paddingTop:u}=ke(),h=d.value.slice(0,d.selectionStart).split(`
`).length-1;ie.style.transform=`translateY(${u+h*y-d.scrollTop}px)`,G&&($.style.transform=`translateY(${u+(G-1)*y-d.scrollTop}px)`)},j=i=>{if(G=i,!i){$.hidden=!0;return}$.hidden=!1,S()},we=i=>{let p=m=>{let b=N.getBoundingClientRect().top,L=I.getBoundingClientRect().bottom-b-i.getBoundingClientRect().height;if(L<=0)return;let D=Math.min(35,176/L*100),pe=Math.max(D,Math.min(78,(L-112)/L*100)),ue=Math.min(pe,Math.max(D,m));e.style.setProperty("--python-editor-height",`${L*ue/100}px`),i.setAttribute("aria-valuemin",String(Math.round(D))),i.setAttribute("aria-valuemax",String(Math.round(pe))),i.setAttribute("aria-valuenow",String(Math.round(ue)))},y=()=>{e.style.removeProperty("--python-editor-height"),requestAnimationFrame(()=>{let m=N.getBoundingClientRect().height,b=m+I.getBoundingClientRect().height;b>0&&i.setAttribute("aria-valuenow",String(Math.round(m/b*100)))})},u=m=>{let b=N.getBoundingClientRect().top,L=I.getBoundingClientRect().bottom-b-i.getBoundingClientRect().height;p((m-b)/L*100)},h=()=>{e.removeAttribute("data-console-resizing"),window.removeEventListener("pointermove",E),window.removeEventListener("pointerup",h)},E=m=>u(m.clientY);i.addEventListener("pointerdown",m=>{m.preventDefault(),e.dataset.consoleResizing="true",u(m.clientY),window.addEventListener("pointermove",E),window.addEventListener("pointerup",h,{once:!0})}),i.addEventListener("dblclick",y),i.addEventListener("keydown",m=>{let b=Number(i.getAttribute("aria-valuenow")??67);m.key==="ArrowUp"||m.key==="ArrowDown"?(m.preventDefault(),p(b+(m.key==="ArrowDown"?5:-5))):m.key==="Home"&&(m.preventDefault(),y())}),y()},le=i=>{_.disabled=i,A.disabled=i,d.disabled=i,v&&v.querySelectorAll("button").forEach(p=>{p.disabled=i||p.dataset.locked==="true"}),_.dataset.running=String(i),xe.setAttribute("d",i?"M12 3a9 9 0 1 1-8.3 5.5M4 4v4h4":"m5 3 14 9-14 9V3z"),i&&(e.dataset.state="loading",M.textContent="RUNNING"),_.querySelector("span").textContent=i?"\u0417\u0430\u043F\u0443\u0441\u043A...":"\u0417\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C"},de=async()=>{let i=c,p=d.value,y=n.length?n[i].tests:r;le(!0),w.innerHTML="",w.append(s("div","python-output-loading","\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 Python \u0438 \u0437\u0430\u043F\u0443\u0441\u043A \u0442\u0435\u0441\u0442\u043E\u0432...")),j();try{let u=await Me(p,y,g),h=u.failed.length>0||!u.codeOk||n.length>0&&u.passed.length===0;e.dataset.state=h?"error":"success",M.textContent=h?"ERROR":"PASS",Ie(w,u,o),j(u.errorLine??u.failed.find(E=>E.line)?.line),!h&&n.length&&(a=he(n,a,i),J(l,a,localStorage),ce(),i<n.length-1&&window.setTimeout(()=>{c===i&&d.value===p&&W(i+1)},900))}catch(u){e.dataset.state="error",M.textContent="ERROR",w.innerHTML="",te(w,"RUNTIME ERROR",u instanceof Error?u.message:String(u))}finally{le(!1)}};d.addEventListener("input",()=>{S(),n.length&&(a.drafts[n[c].id]=d.value,J(l,a,localStorage))}),d.addEventListener("scroll",S),d.addEventListener("click",S),d.addEventListener("keyup",S),d.addEventListener("select",S),d.addEventListener("keydown",i=>{if(i.key==="Tab"){i.preventDefault();let p=d.selectionStart;d.setRangeText("    ",p,d.selectionEnd,"end"),S()}else(i.ctrlKey||i.metaKey)&&i.key==="Enter"&&(i.preventDefault(),de())}),_.addEventListener("click",()=>{de()}),A.addEventListener("click",()=>{d.value=n.length?n[c].starterCode:t,n.length&&(delete a.drafts[n[c].id],J(l,a,localStorage)),Z(w,n.length?n[c].tests:r,o),M.textContent="READY",e.dataset.state="idle",j(),S(),d.focus()});let ce=()=>{if(!v||!F||!z)return;v.replaceChildren(s("span","python-task-rail-caption","PRACTICE")),n.forEach((u,h)=>{let E=a.completed.includes(u.id),m=Y(n,a.completed,h),b=h===c,k=s("button","python-task-step");k.type="button",k.dataset.locked=String(!m),k.disabled=!m,k.setAttribute("aria-current",b?"step":"false");let L=h===n.length-1?"\u0418\u0442\u043E\u0433":`\u041F\u0440\u0430\u043A\u0442\u0438\u043A\u0430 ${h+1}`,D=E?"\u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0430":b?"\u0442\u0435\u043A\u0443\u0449\u0430\u044F":m?"\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430":"\u0437\u0430\u043A\u0440\u044B\u0442\u0430";k.setAttribute("aria-label",`${L} \u2014 ${D}`),k.title=m?`${L}: ${u.title||u.prompt}`:"\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0438 \u043F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0443\u044E \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0443",k.append(s("span",void 0,h===n.length-1?"FINAL":String(h+1).padStart(2,"0")),s("span","python-task-mark",E?"\u2713":m?b?"\u25CF":"\u25CB":"\u{1F512}")),k.addEventListener("click",()=>W(h)),v.append(k)});let i=v.querySelector('[aria-current="step"]');if(i){let u=i.getBoundingClientRect(),h=v.getBoundingClientRect();u.right>h.right&&(v.scrollLeft+=u.right-h.right),u.left<h.left&&(v.scrollLeft-=h.left-u.left)}let p=c===n.length-1;F.textContent=p?"FINAL CHALLENGE":`PRACTICE ${String(c+1).padStart(2,"0")} / ${String(n.length-1).padStart(2,"0")}`,z.textContent=n[c].prompt,T&&(T.replaceChildren(),n[c].hint?(T.append(s("summary",void 0,"\u041F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0430"),s("span",void 0,n[c].hint)),T.hidden=!1,T.open=!1):T.hidden=!0);let y=document.querySelector("[data-practice-progress]");y&&(y.textContent=`${a.completed.filter(u=>u!=="final").length} / ${n.length-1} \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043E`),document.querySelectorAll("[data-coding-next]").forEach(u=>{let h=!a.completed.includes("final");u.setAttribute("aria-disabled",String(h)),u.tabIndex=h?-1:0,u.title=h?"\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0438 \u0438\u0442\u043E\u0433\u043E\u0432\u043E\u0435 \u0437\u0430\u0434\u0430\u043D\u0438\u0435":""})},W=i=>{if(!n.length||!Y(n,a.completed,i))return;c=i;let p=n[i];d.value=a.drafts[p.id]??p.starterCode,e.dataset.state="idle",M.textContent="READY",j(),S(),Z(w,p.tests,o),ce(),d.focus({preventScroll:!0})};if(n.length){let i=[...document.querySelectorAll(".coding-lesson-reading article h3")].find(p=>p.textContent?.trim()==="\u0417\u0430\u0434\u0430\u0447\u0438");if(i?.nextElementSibling?.tagName==="OL"){let p=s("section","coding-practice-summary"),y=s("h3",void 0,"\u041F\u0440\u0430\u043A\u0442\u0438\u043A\u0430"),u=s("p",void 0,"\u041A\u043E\u0440\u043E\u0442\u043A\u0438\u0435 \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u044F \u0437\u0430\u043A\u0440\u0435\u043F\u044F\u0442 \u0442\u0435\u043C\u0443. \u0417\u0430\u0442\u0435\u043C \u043E\u0442\u043A\u0440\u043E\u0435\u0442\u0441\u044F \u0438\u0442\u043E\u0433\u043E\u0432\u043E\u0435 \u0437\u0430\u0434\u0430\u043D\u0438\u0435."),h=s("span","coding-practice-progress");h.dataset.practiceProgress="";let E=s("button","coding-practice-action","\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043A \u0442\u0435\u043A\u0443\u0449\u0435\u0439 \u0437\u0430\u0434\u0430\u0447\u0435 \u2192");E.type="button",E.addEventListener("click",()=>{W(X(n,a.completed)),matchMedia("(max-width: 900px)").matches&&e.scrollIntoView({behavior:"smooth",block:"start"}),d.focus({preventScroll:!0})}),p.append(y,u,h,E);let m=i.nextElementSibling;for(;m&&!/^H[1-3]$/.test(m.tagName);){let b=m.nextElementSibling;m.remove(),m=b}i.replaceWith(p)}document.querySelectorAll("[data-coding-next]").forEach(p=>p.addEventListener("click",y=>{a.completed.includes("final")||y.preventDefault()}))}e.classList.add("python-checker-enhanced"),e.append(P),v&&e.append(v),q&&e.append(q),e.append(N),x&&(e.append(x),we(x)),e.append(I),f||e.classList.add("python-checker-inline"),S(),n.length?W(c):Z(w,r,o)},Be=/^(?:запусти|попробуй)(?=\s|:)/i,Ue=()=>{document.querySelectorAll(".coding-lesson-reading article p").forEach(e=>{if(!Be.test(e.textContent?.trim()??""))return;let t=e.nextElementSibling,r=t?.matches("pre, figure[data-rehype-pretty-code-figure]")?t.querySelector("code"):null;if(!t||!r||t.nextElementSibling?.classList.contains("python-run-example"))return;let o=s("div","python-checker python-run-example");o.dataset.title="\u041F\u0440\u0438\u043C\u0435\u0440",o.dataset.code=r.textContent?.trim()??"",t.replaceWith(o)})},qe=()=>{Ue(),document.querySelectorAll(".python-checker").forEach(De),Fe()},Fe=()=>{document.querySelectorAll(".coding-lesson-split").forEach(e=>{let t=e.querySelector(".coding-splitter");if(!t||t.dataset.ready==="true")return;t.dataset.ready="true";let r=n=>{let l=e.getBoundingClientRect().width;if(l<900){e.style.setProperty("--coding-reading-width","50%");return}let a=Number.parseFloat(getComputedStyle(document.documentElement).fontSize),c=Math.max(32,22*a/l*100),P=Math.min(68,(l-28*a-.7*a)/l*100),H=Math.min(P,Math.max(c,n));e.style.setProperty("--coding-reading-width",`${H}%`),t.setAttribute("aria-valuemin",String(Math.ceil(c))),t.setAttribute("aria-valuemax",String(Math.floor(P))),t.setAttribute("aria-valuenow",String(Math.round(H)))},o=n=>{let l=e.getBoundingClientRect();r((n-l.left)/l.width*100)},g=()=>{e.removeAttribute("data-resizing"),window.removeEventListener("pointermove",f),window.removeEventListener("pointerup",g)},f=n=>o(n.clientX);t.addEventListener("pointerdown",n=>{n.preventDefault(),e.dataset.resizing="true",o(n.clientX),window.addEventListener("pointermove",f),window.addEventListener("pointerup",g,{once:!0})}),t.addEventListener("dblclick",()=>r(50)),t.addEventListener("keydown",n=>{let l=Number(t.getAttribute("aria-valuenow")??50);n.key==="ArrowLeft"||n.key==="ArrowRight"?(n.preventDefault(),r(l+(n.key==="ArrowRight"?4:-4))):n.key==="Home"&&(n.preventDefault(),r(50))}),r(50)})};document.addEventListener("nav",qe);window.addCleanup?.(Q);
