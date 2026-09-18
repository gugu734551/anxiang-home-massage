import React, {useState, useEffect, useRef} from 'react';
import {Clock, ChevronRight, Check, Navigation, MapPin, Headphones, FileText, Star, Plus} from 'lucide-react';
import {useNavigate,useParams} from 'react-router-dom';
import {dayKey,bounds,validateSlot} from './bookingTime';
import {http} from './api/client';
import './bookingFlow.css';

const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const save=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const uuid=()=>{try{if(typeof crypto!=='undefined'&&crypto.randomUUID)return crypto.randomUUID()}catch{}if(typeof crypto!=='undefined'&&crypto.getRandomValues){const b=crypto.getRandomValues(new Uint8Array(16));b[6]=b[6]&0x0f|0x40;b[8]=b[8]&0x3f|0x80;const h=[...b].map(x=>x.toString(16).padStart(2,'0'));return `${h.slice(0,4).join('')}-${h.slice(4,6).join('')}-${h.slice(6,8).join('')}-${h.slice(8,10).join('')}-${h.slice(10,16).join('')}`}return 'id-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10)};
const draftKey='anxiang_booking_draft';

const WHEEL_H=40;
function pad(n){return String(n).padStart(2,'0')}
function TimePickerModal({open,value,onClose,onConfirm}){
  const hourRef=useRef(null);const minRef=useRef(null);
  const hours=Array.from({length:24},(_,i)=>pad(i));
  const minutes=Array.from({length:60},(_,i)=>pad(i));
  const [selH,setSelH]=useState('09');const [selM,setSelM]=useState('00');
  const scrollTo=(ref,arr,val)=>{const idx=arr.indexOf(val);if(idx>=0&&ref.current)ref.current.scrollTop=idx*WHEEL_H};
  useEffect(()=>{if(open){const [h,m]=(value||'09:00').split(':');setSelH(pad(Number(h)));setSelM(pad(Number(m)));requestAnimationFrame(()=>{scrollTo(hourRef,hours,pad(Number(h)));scrollTo(minRef,minutes,pad(Number(m)))})}},[open]);
  const onScroll=(ref,arr,setter)=>{if(!ref.current)return;const idx=Math.round(ref.current.scrollTop/WHEEL_H);setter(arr[Math.max(0,Math.min(arr.length-1,idx))])};
  if(!open)return null;
  return <div className="modal-backdrop time-picker-backdrop" onClick={onClose}>
    <section className="time-picker-modal" onClick={e=>e.stopPropagation()}>
      <header className="tp-header"><button onClick={onClose}>取消</button><h3>选择上门时间</h3><button className="tp-confirm" onClick={()=>onConfirm(`${selH}:${selM}`)}>确定</button></header>
      <div className="wheel-viewport">
        <div className="wheel-highlight"/>
        <div className="wheel-col" ref={hourRef} onScroll={()=>onScroll(hourRef,hours,setSelH)}>
          {[0,1].map(i=><span key={'hs'+i} className="wheel-spacer" style={{height:WHEEL_H*2}}/>)}
          {hours.map(h=><div key={h} className={`wheel-item ${selH===h?'sel':''}`} style={{height:WHEEL_H}}>{h}</div>)}
          {[0,1].map(i=><span key={'he'+i} className="wheel-spacer" style={{height:WHEEL_H*2}}/>)}
        </div>
        <div className="wheel-col" ref={minRef} onScroll={()=>onScroll(minRef,minutes,setSelM)}>
          {[0,1].map(i=><span key={'ms'+i} className="wheel-spacer" style={{height:WHEEL_H*2}}/>)}
          {minutes.map(m=><div key={m} className={`wheel-item ${selM===m?'sel':''}`} style={{height:WHEEL_H}}>{m}</div>)}
          {[0,1].map(i=><span key={'me'+i} className="wheel-spacer" style={{height:WHEEL_H*2}}/>)}
        </div>
      </div>
      <p className="tp-hint">仅支持未来一个月内预约 · 时 {selH} : 分 {selM}</p>
    </section>
  </div>;
}

const DEFAULT_ADDRESSES=[{id:1,name:'李先生',phone:'138****8888',city:'北京市',district:'朝阳区',detail:'建国路88号 华贸中心 1号楼 1203室',isDefault:true}];
function loadAddresses(){return read('anxiang_addresses',null)||DEFAULT_ADDRESSES}
const SELECTED_ADDR_KEY='anxiang_selected_address';
function DragRow({className='',children}){
  const ref=useRef(null);const down=useRef(false);const moved=useRef(false);const startX=useRef(0);const startL=useRef(0);const pid=useRef(null);
  const onDown=e=>{if(e.pointerType!=='mouse')return;down.current=true;moved.current=false;startX.current=e.clientX;startL.current=ref.current.scrollLeft};
  const onMove=e=>{if(!down.current)return;const dx=e.clientX-startX.current;if(!moved.current&&Math.abs(dx)>5){moved.current=true;pid.current=e.pointerId;try{ref.current.setPointerCapture(pid.current)}catch{};ref.current.classList.add('dragging')}if(moved.current)ref.current.scrollLeft=startL.current-dx};
  const end=()=>{down.current=false;if(pid.current!==null){try{ref.current.releasePointerCapture(pid.current)}catch{}pid.current=null}if(ref.current)ref.current.classList.remove('dragging')};
  return <div ref={ref} className={`drag-scroll scroll-row ${className}`}
    onPointerDown={onDown} onPointerMove={onMove} onPointerUp={end} onPointerCancel={end}
    onClickCapture={e=>{if(moved.current){e.stopPropagation();e.preventDefault();moved.current=false}}}>{children}</div>;
}
function TherapistPickerModal({open,list,selectedId,onClose,onSelect}){
  if(!open)return null;
  return <div className="modal-backdrop after-sales-sheet" onClick={onClose}>
    <section className="picker-modal" onClick={e=>e.stopPropagation()}>
      <div className="as-handle"/>
      <header className="picker-head"><button onClick={onClose}>取消</button><h3>选择按摩师</h3><button className="tp-confirm" onClick={onClose}>确定</button></header>
      <div className="picker-list">
        {list.map(p=>{const sel=p.id===selectedId;return <button key={p.id} className={`tp-row ${sel?'sel':''}`} onClick={()=>{onSelect(p.id);onClose()}}>
          <div className="photo tp-avatar" style={{backgroundImage:`url(${p.avatar})`,backgroundPosition:p.pos}}/>
          <div className="tp-info"><b>{p.name}{p.female&&<em className="tp-female">女</em>}</b><div className="tp-meta"><strong><Star fill="currentColor"/>{p.score}</strong><span>{p.years}年经验</span><span>已服务{p.served}次</span></div><div className="tp-tags">{p.tags.map(x=><span key={x}>{x}</span>)}</div></div>
          <span className={`tp-radio ${sel?'on':''}`}>{sel&&<Check/>}</span>
        </button>})}
      </div>
    </section>
  </div>;
}

export function BookingFlow({services,therapists,Hero,TopSearch,BottomNav,ServiceCard,TherapistCard}){
  const navigate=useNavigate();const query=new URLSearchParams(location.search);
  const [draft,setDraft]=useState(()=>({...read(draftKey,{}),serviceId:Number(query.get('serviceId'))||read(draftKey,{}).serviceId||1,therapistId:Number(query.get('therapistId'))||read(draftKey,{}).therapistId||1}));
  const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const [pickerOpen,setPickerOpen]=useState(false);
  const [tPickerOpen,setTPickerOpen]=useState(false);
  const update=(value)=>{const next={...draft,...value};setDraft(next);save(draftKey,next);setError('')};
  const service=services.find(s=>s.id===draft.serviceId)||services[0];const therapist=therapists.find(s=>s.id===draft.therapistId)||therapists[0];
  const addresses=loadAddresses();
  const selAddrId=Number(localStorage.getItem(SELECTED_ADDR_KEY))||0;
  const address=addresses.find(a=>a.id===selAddrId)||addresses.find(a=>a.isDefault)||null;
  const limit=bounds();const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()+i);return dayKey(d)});
  const submit=async()=>{const problem=validateSlot(draft.date||'',draft.time||'');if(problem){setError(problem);return}if(!address){setError('请选择上门服务地址');return}setBusy(true);try{
    const payload={...draft,serviceId:service.id,therapistId:therapist.id,addressId:address.id,address};
    const order=import.meta.env.VITE_USE_MOCK==='false'?await http.post('/orders',payload):{...payload,id:uuid(),status:'PENDING_PAYMENT',service,therapist,amount:service.price,createdAt:new Date().toISOString()};
    save('anxiang_order_'+order.id,order);save('anxiang_latest_order',order.id);navigate('/order/'+order.id);
  }catch(e){setError(e.message)}finally{setBusy(false)}};
  return <main className="with-action"><Hero page="booking"/><div className="sheet booking"><TopSearch/>
    <div className="section-title"><h2>选择时间</h2><button onClick={()=>navigate('/booking/date')}>查看全部 ›</button></div>
    <div className="time-inline"><Clock/><span>上门时间</span><button className="time-chip" onClick={()=>setPickerOpen(true)}><b>{draft.time||'选择时间'}</b><ChevronRight/></button></div>
    <div className="dates">{days.map((d,i)=><button key={d} className={draft.date===d?'active':''} onClick={()=>update({date:d,time:''})}><b>{i===0?'今天':i===1?'明天':new Date(d+'T12:00').toLocaleDateString('zh-CN',{weekday:'short'})}</b><span>{d.slice(5)}</span></button>)}</div>
    <p className="slot-help">{draft.date?'已选日期：'+draft.date:'请选择预约日期'} · 最晚 {limit.max}</p>
    <div className="section-title"><h2>选择服务项目</h2><button onClick={()=>navigate('/services')}>查看全部 ›</button></div><DragRow className="services">{services.map(s=><ServiceCard key={s.id} compact service={s} selected={service.id===s.id} onClick={()=>update({serviceId:s.id})}/>)}</DragRow>
    <div className="section-title"><h2>选择按摩师</h2><button onClick={()=>setTPickerOpen(true)}>查看全部 ›</button></div><DragRow className="therapists">{therapists.map(t=><TherapistCard key={t.id} compact person={t} selected={therapist.id===t.id} onClick={()=>update({therapistId:t.id})}/>)}</DragRow>
    <div className="section-title"><h2>上门地址</h2><button onClick={()=>navigate('/addresses?select=1')}>管理地址 ›</button></div>
    {address?<button className="addr-selected" onClick={()=>navigate('/addresses?select=1')}><span className="addr-check on"><Check/></span><MapPin/><div className="addr-text"><b>{address.city}{address.district} {address.detail}{address.isDefault&&<em>默认</em>}</b><small>{address.name}　{address.phone}</small></div><ChevronRight/></button>:<button className="addr-empty" onClick={()=>navigate('/addresses?select=1')}><Plus/>请先在管理地址中选择服务地址</button>}
    {error&&<p role="alert" className="flow-error">{error}</p>}
    </div><div className="booking-bar"><div><b>{service.name}</b><small>{draft.date||'请选择日期'} {draft.time||'请选择时间'} · {therapist.name} · {address?address.city+address.district:'请选择地址'}</small></div><strong>¥{service.price}</strong><button disabled={busy||!draft.date||!draft.time||!address} onClick={submit}>{busy?'提交中…':'立即预约'}</button></div><BottomNav/>
    <TimePickerModal open={pickerOpen} value={draft.time} onClose={()=>setPickerOpen(false)} onConfirm={t=>{update({time:t});setPickerOpen(false)}}/>
    <TherapistPickerModal open={tPickerOpen} list={therapists} selectedId={therapist.id} onClose={()=>setTPickerOpen(false)} onSelect={id=>update({therapistId:id})}/>
  </main>
}

export function DatePickerPage(){const navigate=useNavigate();const limit=bounds();const draft=read(draftKey,{});const [month,setMonth]=useState((draft.date>=limit.min&&draft.date<=limit.max?draft.date:limit.min).slice(0,7));const [selected,setSelected]=useState(draft.date||'');const [error,setError]=useState('');const [year,m]=month.split('-').map(Number);const offset=(new Date(year,m-1,1).getDay()+6)%7;const count=new Date(year,m,0).getDate();
  const confirm=()=>{const latest=bounds();if(selected<latest.min||selected>latest.max){setError('请选择今天至一个月内的日期');return}save(draftKey,{...draft,date:selected,time:selected===draft.date?draft.time:''});navigate('/booking',{replace:true})};
  return <main><header className="sub-header"><button onClick={()=>navigate('/booking')}>‹ 返回</button><h1>选择预约日期</h1></header><div className="sub-body"><section className="calendar-card"><label>选择月份<select aria-label="选择月份" value={month} onChange={e=>setMonth(e.target.value)}>{[...new Set([limit.min.slice(0,7),limit.max.slice(0,7)])].map(v=><option key={v}>{v}</option>)}</select></label><p className="slot-help">可预约 {limit.min} 至 {limit.max}</p><div className="calendar-grid">{'一二三四五六日'.split('').map(x=><b key={x}>{x}</b>)}{Array.from({length:offset},(_,i)=><span key={'blank'+i}/>)}{Array.from({length:count},(_,i)=>{const key=month+'-'+String(i+1).padStart(2,'0');return <button key={key} disabled={key<limit.min||key>limit.max} className={selected===key?'active':''} onClick={()=>{setSelected(key);setError('')}}>{i+1}</button>})}</div><p>已选：{selected||'尚未选择'}</p>{error&&<p role="alert">{error}</p>}<button className="primary-wide" disabled={!selected} onClick={confirm}>确认日期</button></section></div></main>
}

const STAGES=[
  {key:'CONFIRMING',title:'师傅确认中',desc:'订单已支付，师傅正在确认接单',icon:'confirm'},
  {key:'ON_THE_WAY',title:'师傅赶来中',desc:'师傅已接单，正在赶往您的地址',icon:'way'},
  {key:'COMPLETED',title:'订单已完成',desc:'服务已完成，期待下次为您服务',icon:'done'}
];
function stageIndex(p){return STAGES.findIndex(s=>s.key===p)}
function ProgressTracker({progress}){
  const cur=stageIndex(progress);
  return <section className="progress-tracker"><h2>服务进度</h2><div className="timeline">{STAGES.map((s,i)=>{
    const done=i<cur;const current=i===cur;const cls=done?'done':current?'current':'pending';
    return <div className={`tl-item ${cls}`} key={s.key}><div className="tl-rail"><div className="tl-marker">{done?<Check/>:<span className={`tl-dot ${current?'pulse':''}`}/>}</div>{i<STAGES.length-1&&<div className={`tl-connector ${i<cur?'active':''}`}/>}</div><div className="tl-content"><b>{s.title}</b><small>{done?'已完成':current?s.desc:'等待中'}</small></div></div>;
  })}</div></section>;
}
function useProgressAdvance(order,setOrder,resolved){
  useEffect(()=>{if(!order||order.status!=='CONFIRMED'||!order.progress||order.progress==='COMPLETED')return;const delay=order.progress==='CONFIRMING'?5000:10000;const nextKey=order.progress==='CONFIRMING'?'ON_THE_WAY':'COMPLETED';const t=setTimeout(()=>{const next={...order,progress:nextKey,status:nextKey==='COMPLETED'?'COMPLETED':'CONFIRMED'};save('anxiang_order_'+resolved,next);setOrder(next)},delay);return ()=>clearTimeout(t)},[order,resolved]);
}
export function PaymentOrderPage({BottomNav}){const {id}=useParams();const navigate=useNavigate();const resolved=id==='1'?read('anxiang_latest_order',id):id;const [order,setOrder]=useState(()=>read('anxiang_order_'+resolved,null));const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [checkout,setCheckout]=useState(false);const [afterSales,setAfterSales]=useState(false);
  useEffect(()=>{setOrder(read('anxiang_order_'+resolved,null))},[resolved]);
  const real=import.meta.env.VITE_USE_MOCK==='false';
  const sync=async()=>{setBusy(true);try{const response=await http.get('/orders/'+resolved);setOrder(response);save('anxiang_order_'+resolved,response);if(response.status==='PENDING_PAYMENT')setError('尚未收到支付成功结果，请稍后查询')}catch(e){setError(e.message)}finally{setBusy(false)}};
  useEffect(()=>{if(real)sync()},[resolved]);
  const pay=async()=>{setError('');if(!real){setCheckout(true);return}setBusy(true);try{const result=await http.post('/orders/'+resolved+'/payments',{});if(result.checkoutUrl&&new URL(result.checkoutUrl).protocol==='https:')window.location.assign(result.checkoutUrl);else setError('支付通道暂不可用，请稍后重试')}catch(e){setError(e.message)}finally{setBusy(false)}};
  const simulate=async(success)=>{setBusy(true);setError('');try{const response=await new Promise(resolve=>setTimeout(()=>resolve({status:success?'PAID':'FAILED'}),700));if(response.status==='PAID'){const next={...order,status:'CONFIRMED',paidAt:new Date().toISOString(),progress:'CONFIRMING'};save('anxiang_order_'+resolved,next);setOrder(next);setCheckout(false)}else setError('支付未成功，订单仍为待支付，可重新尝试')}finally{setBusy(false)}};
  useProgressAdvance(order,setOrder,resolved);
  if(!order)return <main><header className="sub-header"><h1>我的订单</h1></header><div className="sub-body"><p>{error||'暂无预约订单'}</p><button className="primary-wide" onClick={()=>navigate('/booking')}>去预约</button></div><BottomNav/></main>;
  const confirmed=['CONFIRMED','PAID','COMPLETED'].includes(order.status);
  const sp=order.progress;const stage=sp?STAGES[stageIndex(sp)]:null;
  const stateTitle=!confirmed?'订单待支付':sp==='COMPLETED'?'订单已完成':sp==='ON_THE_WAY'?'师傅赶来中':sp==='CONFIRMING'?'师傅确认中':'订单已确认';
  const stateDesc=!confirmed?'请完成支付，支付成功后确认预约':sp==='COMPLETED'?'服务已完成，期待下次为您服务':sp==='ON_THE_WAY'?'师傅已接单，正在赶往您的地址':sp==='CONFIRMING'?'订单已支付，师傅正在确认接单':'支付成功，请等待上门服务';
  const stateBadge=!confirmed?'待支付':sp==='COMPLETED'?'已完成':sp==='ON_THE_WAY'?'赶来中':sp==='CONFIRMING'?'已确认':'待服务';
  const done=sp==='COMPLETED';
  return <main className="with-action"><header className="sub-header"><button onClick={()=>navigate('/booking')}>‹ 返回</button><h1>订单详情</h1></header><div className="sub-body"><section className="state-card"><div><h2>{stateTitle}</h2><p>{stateDesc}</p></div><b>{stateBadge}</b></section><section className="order-card"><h2>服务项目</h2><div className="flow-service"><img src={order.service?.img} alt=""/><div><b>{order.service?.name}</b><p>{order.service?.mins}分钟 · {order.therapist?.name}</p><strong>¥{order.amount}</strong></div></div><div className="details"><p>预约日期：{order.date}</p><p>上门时间：{order.time}</p>{order.address&&<p>上门地址：{order.address.city}{order.address.district} {order.address.detail}</p>}<p>订单编号：{order.id}</p></div></section>{confirmed&&sp&&<ProgressTracker progress={sp}/>}<section className="order-card"><h2>费用明细</h2><div className="fees"><p>服务金额 <span>¥{order.amount}</span></p><p>上门费 <span>¥0</span></p><strong>{confirmed?'实付金额':'待付金额'}<b>¥{order.amount}</b></strong></div></section>{error&&<p role="alert" className="flow-error">{error}</p>}{!confirmed&&real&&<button className="primary-wide" disabled={busy} onClick={sync}>查询支付结果</button>}</div><div className="order-actions"><button onClick={()=>setAfterSales(true)}>申请售后</button><button disabled={busy} onClick={confirmed?()=>navigate('/order/'+resolved+'/track'):pay}>{busy?'处理中…':done?'再次预约':confirmed?'查看进度':'立即支付'}</button></div><BottomNav/>{checkout&&<div className="modal-backdrop"><section className="call-modal" role="dialog" aria-modal="true" aria-label="演示支付"><h3>演示支付</h3><p>¥{order.amount} · 仅演示，不会真实扣款</p><button className="primary-wide" disabled={busy} onClick={()=>simulate(true)}>模拟支付成功响应</button><button disabled={busy} onClick={()=>simulate(false)}>模拟支付失败</button><button disabled={busy} onClick={()=>setCheckout(false)}>暂不支付</button>{error&&<p role="alert">{error}</p>}</section></div>}{afterSales&&<div className="modal-backdrop after-sales-sheet" onClick={()=>setAfterSales(false)}><section className="after-sales-modal" onClick={e=>e.stopPropagation()}><div className="as-handle"/><h3>申请售后</h3><button onClick={()=>{setAfterSales(false);navigate('/order/'+resolved+'/complaint')}}><FileText/><div><b>订单申诉</b><small>对订单有异议，提交申诉申请</small></div><ChevronRight/></button><button onClick={()=>{setAfterSales(false);navigate('/feature/support')}}><Headphones/><div><b>联系客服</b><small>在线或电话联系客服处理</small></div><ChevronRight/></button><button className="as-cancel" onClick={()=>setAfterSales(false)}>取消</button></section></div>}</main>
}

export function OrderTrackPage({BottomNav}){const {id}=useParams();const navigate=useNavigate();const resolved=id==='1'?read('anxiang_latest_order',id):id;const [order,setOrder]=useState(()=>read('anxiang_order_'+resolved,null));
  useEffect(()=>{setOrder(read('anxiang_order_'+resolved,null))},[resolved]);
  useProgressAdvance(order,setOrder,resolved);
  if(!order)return <main><header className="sub-header"><button onClick={()=>navigate('/order/'+resolved)}>‹ 返回</button><h1>服务追踪</h1></header><div className="sub-body"><p>暂无订单信息</p><button className="primary-wide" onClick={()=>navigate('/booking')}>去预约</button></div><BottomNav/></main>;
  const sp=order.progress;const confirmed=['CONFIRMED','PAID','COMPLETED'].includes(order.status);
  const cur=sp?stageIndex(sp):-1;
  const eta=sp==='CONFIRMING'?'师傅确认中，请稍候':sp==='ON_THE_WAY'?'预计 15 分钟后到达':sp==='COMPLETED'?'师傅已到达，服务完成':'待支付';
  const dist=sp==='ON_THE_WAY'?'距您约 3.2 公里':sp==='COMPLETED'?'已到达目的地':'等待师傅接单';
  const tPos=cur<=0?{left:'18%',top:'72%'}:cur===1?{left:'48%',top:'48%'}:{left:'76%',top:'28%'};
  return <main className="with-action"><header className="sub-header"><button onClick={()=>navigate('/order/'+resolved)}>‹ 返回</button><h1>服务追踪</h1></header><div className="sub-body">{confirmed&&sp&&<ProgressTracker progress={sp}/>}<section className="track-map"><div className="map-canvas"><svg className="map-route" viewBox="0 0 300 200" fill="none" preserveAspectRatio="none"><path d="M54 144 Q120 80 228 56" stroke="#376f3d" strokeWidth="3" strokeDasharray="8 6" strokeLinecap="round"/><circle cx="54" cy="144" r="6" fill="#376f3d"/><circle cx="228" cy="56" r="6" fill="#ff5c24"/></svg><div className="map-marker m-therapist" style={tPos}><Navigation/></div><div className="map-marker m-customer" style={{left:'76%',top:'28%'}}><MapPin/></div><div className="map-label" style={{left:'18%',top:'78%'}}>师傅出发</div><div className="map-label" style={{left:'76%',top:'20%'}}>您的位置</div></div><div className="map-eta"><b>{eta}</b><small>{dist} · {order.therapist?.name} 正在为您服务</small></div></section><section className="order-card"><h2>订单信息</h2><div className="flow-service"><img src={order.service?.img} alt=""/><div><b>{order.service?.name}</b><p>{order.service?.mins}分钟 · {order.therapist?.name}</p><strong>¥{order.amount}</strong></div></div><div className="details"><p>预约日期：{order.date}</p><p>上门时间：{order.time}</p>{order.address&&<p>上门地址：{order.address.city}{order.address.district} {order.address.detail}</p>}<p>订单编号：{order.id}</p></div></section></div><div className="order-actions"><button onClick={()=>navigate('/order/'+resolved)}>返回订单</button><button onClick={()=>navigate('/feature/support')}>联系师傅</button></div><BottomNav/></main>
}

export function ComplaintPage({BottomNav}){const {id}=useParams();const navigate=useNavigate();const resolved=id==='1'?read('anxiang_latest_order',id):id;const [order]=useState(()=>read('anxiang_order_'+resolved,null));const [type,setType]=useState('service');const [submitted,setSubmitted]=useState(false);
  if(!order)return <main><header className="sub-header"><button onClick={()=>navigate('/order/'+resolved)}>‹ 返回</button><h1>订单申诉</h1></header><div className="sub-body"><p>暂无订单信息</p></div><BottomNav/></main>;
  return <main className="with-action"><header className="sub-header"><button onClick={()=>navigate('/order/'+resolved)}>‹ 返回</button><h1>订单申诉</h1></header><div className="sub-body"><section className="order-card"><h2>订单信息</h2><div className="flow-service"><img src={order.service?.img} alt=""/><div><b>{order.service?.name}</b><p>{order.date} {order.time}</p><strong>¥{order.amount}</strong></div></div></section>{submitted?<section className="complaint-done"><span className="cd-icon"><Check/></span><h2>申诉已提交</h2><p>我们将在 24 小时内审核并联系您处理</p><button className="primary-wide" onClick={()=>navigate('/order/'+resolved)}>返回订单</button></section>:<section className="complaint-form"><h2>申诉类型</h2><div className="complaint-types">{[{k:'service',t:'服务质量问题'},{k:'fee',t:'费用争议'},{k:'therapist',t:'师傅行为'},{k:'other',t:'其他问题'}].map(o=><button key={o.k} className={type===o.k?'active':''} onClick={()=>setType(o.k)}>{o.t}</button>)}</div><h2>问题描述</h2><textarea placeholder="请详细描述您遇到的问题，以便我们更好地处理您的申诉" rows={5}/><button className="primary-wide" onClick={()=>setSubmitted(true)}>提交申诉</button><p className="slot-help">提交后客服将在 24 小时内联系您处理，请保持电话畅通。</p></section>}</div><BottomNav/></main>
}
