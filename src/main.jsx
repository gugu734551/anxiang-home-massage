import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useParams } from 'react-router-dom';
import {
  Home as HomeIcon, CalendarCheck, UserRound, ClipboardList, MapPin, Search, ChevronRight,
  ShieldCheck, Heart, Leaf, Moon, Grid2X2, Gift, Users, Star, Check, Clock3, Phone,
  Headphones, Ticket, Settings, FileText, MessageSquare, BadgeCheck, Navigation,
  ArrowLeft, Copy, SlidersHorizontal, Sparkles, Stethoscope, ReceiptText, CircleUserRound
} from 'lucide-react';
import './styles.css';
import { BookingFlow, DatePickerPage, PaymentOrderPage, OrderTrackPage, ComplaintPage } from './BookingFlow';

const services = [
  { id: 1, name: '肩颈舒缓按摩', mins: 60, price: 198, img: '/assets/generated/service-neck.png', pos: 'center', tags: ['缓解肩颈', '放松肌肉'] },
  { id: 2, name: '全身放松按摩', mins: 90, price: 298, img: '/assets/generated/service-fullbody.png', pos: 'center', tags: ['全身放松', '舒缓疲劳'] },
  { id: 3, name: '经络调理', mins: 70, price: 258, img: '/assets/generated/service-meridian.png', pos: 'center', tags: ['经络疏通', '深度调理'] },
  { id: 4, name: '助眠头部按摩', mins: 60, price: 168, img: '/assets/generated/service-sleep.png', pos: 'center', tags: ['舒缓助眠', '头部放松'] },
];

const therapists = [
  { id: 1, name: '李师傅', score: '5.0', years: 3, served: '1200+', avatar: '/assets/generated/therapist-li.png', pos: 'center', tags: ['肩颈调理', '全身放松'], female: true },
  { id: 2, name: '王师傅', score: '4.9', years: 5, served: '800+', avatar: '/assets/generated/therapist-wang.png', pos: 'center', tags: ['经络调理', '助眠舒压'] },
  { id: 3, name: '张师傅', score: '4.8', years: 4, served: '600+', avatar: '/assets/generated/therapist-zhang.png', pos: 'center', tags: ['肩颈放松', '全身调理'] },
  { id: 4, name: '陈师傅', score: '4.9', years: 6, served: '900+', avatar: '/assets/generated/therapist-chen.png', pos: 'center', tags: ['产后修复', '经络调理'], female: true },
];

function ImageCrop({ src, pos, className='' }) {
  return <div className={`photo ${className}`} style={{backgroundImage:`url(${src})`, backgroundPosition:pos}} />;
}

function MiniProgramPill(){return <div className="mini-pill"><b>•••</b><i/><span>◉</span></div>}

function Hero({ page='home' }) {
  const content = {
    home: ['专业按摩 上门到家','把 放 松 带 到 你 身 边'],
    booking: ['预约服务','选 择 你 的 放 松 时 间'],
    therapists: ['优选按摩师','专业服务 · 安心上门 · 一键预约'],
  }[page];
  return <header className={`hero hero-${page}`}>
    <div className="status"><b>9:41</b><span>▮▮▮ ))) ▰</span></div>
    <MiniProgramPill />
    <div className="brand">按享到家</div>
    <div className="brand-sub">专业按摩师 · 上门服务 · 放松身心</div>
    <h1>{content[0]}</h1><p>{content[1]}</p>
    <div className="handwrite">好时光<br/>从一次放松开始</div>
    <div className="promises"><span><ShieldCheck/> 实名认证<br/>持证上岗</span><span><Heart/> 全程保障<br/>安全放心</span><span><Leaf/> 优质服务<br/>不满意可退</span></div>
  </header>
}

function TopSearch(){
  const navigate=useNavigate(); const [open,setOpen]=useState(false); const [city,setCity]=useState(localStorage.getItem('anxiang_city')||'北京市'); const [district,setDistrict]=useState(localStorage.getItem('anxiang_district')||'朝阳区');
  const choose=(c,d)=>{setCity(c);setDistrict(d);localStorage.setItem('anxiang_city',c);localStorage.setItem('anxiang_district',d);setOpen(false)};
  return <><div className="top-search"><button className="location" onClick={()=>setOpen(true)}><MapPin/><b>{city} {district}</b><ChevronRight/></button><label><Search/><input onKeyDown={e=>e.key==='Enter'&&navigate('/services?keyword='+encodeURIComponent(e.currentTarget.value))} placeholder="搜索服务项目、按摩师"/></label></div>{open&&<div className="modal-backdrop" onClick={()=>setOpen(false)}><div className="picker-modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><h3>选择服务地区</h3><button onClick={()=>setOpen(false)}>×</button></div><p>当前开通城市</p>{[['北京市','朝阳区'],['北京市','海淀区'],['北京市','东城区'],['上海市','浦东新区'],['深圳市','南山区']].map(([c,d])=><button className={(city===c&&district===d)?'chosen':''} key={c+d} onClick={()=>choose(c,d)}><MapPin/>{c} · {d}<Check/></button>)}</div></div>}</>
}

const navs = [
  ['/',HomeIcon,'首页'], ['/booking',CalendarCheck,'预约'], ['/therapists',UserRound,'按摩师'], ['/order/1',ClipboardList,'订单'], ['/profile',CircleUserRound,'我的']
];
function BottomNav(){return <nav className="bottom-nav">{navs.map(([to,I,t])=><NavLink key={to} to={to} end={to==='/'}><I/><span>{t}</span></NavLink>)}</nav>}

function SectionTitle({title, more=true, onMore}){return <div className="section-title"><h2>{title}</h2>{more&&<button onClick={onMore}>查看全部 <ChevronRight/></button>}</div>}

function ServiceCard({service, compact=false, selected=false, onClick}){return <button className={`service-card ${compact?'compact':''} ${selected?'selected':''}`} onClick={onClick}>
  <ImageCrop src={service.img} pos={service.pos}/><div className="service-copy"><b>{service.name}</b><small>{service.mins}分钟</small><strong>¥ {service.price}</strong></div>
  {compact ? <span className="radio">{selected&&<Check/>}</span> : <span className="reserve">立即预约</span>}
</button>}

function TherapistCard({person, compact=false, selected=false, onClick}){return <button className={`therapist-card ${compact?'compact':''} ${selected?'selected':''}`} onClick={onClick}>
  {person.id===1&&!compact&&<em>人气推荐</em>}<ImageCrop src={person.avatar} pos={person.pos}/>
  <div className="therapist-copy"><b>{person.name}</b><strong><Star fill="currentColor"/> {person.score}</strong><small>{person.years}年经验</small>{!compact&&<><div className="tags">{person.tags.map(x=><span key={x}>{x}</span>)}</div><small>已服务 {person.served} 次</small></>}</div>
  {compact?<span className="radio">{selected&&<Check/>}</span>:<span className="available">可预约</span>}
</button>}

function HomePage(){const navigate=useNavigate();const categories=[[Leaf,'中式推拿','g'],[SlidersHorizontal,'肩颈放松','o'],[Sparkles,'全身调理','b'],[UserRound,'产后修复','r'],[Moon,'助眠舒压','p'],[Grid2X2,'全部服务','o']];return <main><Hero page="home"/><div className="sheet"><TopSearch/>
  <div className="category-grid">{categories.map(([I,t,c])=><button onClick={()=>navigate('/booking?category='+encodeURIComponent(t))} key={t}><span className={c}><I/></span><b>{t}</b></button>)}</div>
  <div className="promo-row"><button className="promo orange" onClick={()=>navigate('/feature/new-user')}><b>新人专享</b><span>首单立减 30 元</span><i>立即领取 <ChevronRight/></i><Gift/></button><button className="promo green" onClick={()=>navigate('/feature/invite')}><b>邀请好友</b><span>双方各得 20 元</span><i>去邀请 <ChevronRight/></i><Users/></button></div>
  <SectionTitle title="热门服务" onMore={()=>navigate('/services')}/><div className="service-grid">{services.map(s=><ServiceCard key={s.id} service={s} onClick={()=>navigate('/booking?serviceId='+s.id)}/>)}</div>
  </div><BottomNav/></main>}
function Chips({items, value, onChange}){return <div className="chips">{items.map(x=><button className={x===value?'active':''} onClick={()=>onChange(x)} key={x}>{x}</button>)}</div>}

function BookingPage(){
  const navigate=useNavigate(); const params=new URLSearchParams(location.search); const [category,setCategory]=useState(params.get('category')||'全部服务'); const [date,setDate]=useState(0); const [time,setTime]=useState('13:00'); const [serviceId,setServiceId]=useState(Number(params.get('serviceId'))||1); const [therapistId,setTherapistId]=useState(Number(params.get('therapistId'))||1);
  const service=services.find(x=>x.id===serviceId), therapist=therapists.find(x=>x.id===therapistId);
  return <main className="with-action"><Hero page="booking"/><div className="sheet booking"><TopSearch/><Chips items={['全部服务','中式推拿','肩颈放松','全身调理','产后修复','助眠舒压']} value={category} onChange={setCategory}/>
    <SectionTitle title="选择日期"/><div className="dates">{[['今天','03/20'],['明天','03/21'],['周六','03/22'],['周日','03/23'],['周一','03/24'],['周二','03/25'],['周三','03/26']].map((d,i)=><button onClick={()=>setDate(i)} className={date===i?'active':''} key={d[1]}><b>{d[0]}</b><span>{d[1]}</span><i>—</i></button>)}</div>
    <SectionTitle title="选择时间" more={false}/><div className="times">{['10:00','11:30','13:00','14:30','16:00','18:30'].map(t=><button className={time===t?'active':''} onClick={()=>setTime(t)} key={t}>{t}</button>)}</div>
    <SectionTitle title="选择服务项目" onMore={()=>navigate('/services')}/><div className="scroll-row services">{services.slice(0,3).map(s=><ServiceCard compact selected={s.id===serviceId} onClick={()=>setServiceId(s.id)} key={s.id} service={s}/>)}</div>
    <SectionTitle title="选择按摩师" onMore={()=>navigate('/therapists')}/><div className="scroll-row therapists">{therapists.slice(0,3).map(p=><TherapistCard compact selected={p.id===therapistId} onClick={()=>setTherapistId(p.id)} key={p.id} person={p}/>)}</div>
    <SectionTitle title="上门地址" more={false}/><button className="address-row" onClick={()=>navigate('/addresses?select=1')}><MapPin/><div><b>北京市朝阳区 建国路88号 华贸中心 1号楼 1203室</b><small>李先生　138****8888</small></div><span>编辑 <ChevronRight/></span></button>
  </div><div className="booking-bar"><ImageCrop src={service.img} pos={service.pos}/><div><b>{service.name}</b><small>{service.mins}分钟 ｜ {therapist.name} ｜ {time}</small></div><strong>¥{service.price}</strong><button onClick={()=>location.href='/order/1'}>立即预约</button></div><BottomNav/></main>
}

function TherapistsPage(){const navigate=useNavigate();const [filter,setFilter]=useState('全部');return <main><Hero page="therapists"/><div className="sheet therapists-page"><TopSearch/><Chips items={['全部','肩颈放松','全身调理','助眠舒压','产后修复']} value={filter} onChange={setFilter}/><SectionTitle title="热门按摩师" onMore={()=>navigate('/feature/all-therapists')}/><div className="therapist-grid">{therapists.map(p=><TherapistCard key={p.id} person={p} onClick={()=>navigate('/feature/therapist-'+p.id)}/>)}</div><SectionTitle title="服务保障" more={false}/><div className="guarantees"><span><ShieldCheck/><b>实名认证</b><small>持证上岗 专业可靠</small></span><span><Heart/><b>服务保障</b><small>全程保险 安全放心</small></span><span><Clock3/><b>准时上门</b><small>按时到达 不爽约</small></span></div><div className="recommend"><ImageCrop src="/assets/generated/therapist-li.png" pos="center"/><div><b>为你推荐 李师傅</b><small>专业手法 · 服务细致 · 好评率 99%</small></div><button onClick={()=>navigate('/booking?therapistId=1')}>立即预约</button></div></div><BottomNav/></main>}

function ProfilePage(){const navigate=useNavigate();const serviceItems=[[CalendarCheck,'我的预约','即将到来的服务','bookings'],[ClipboardList,'我的订单','查看全部订单','orders'],[UserRound,'我的按摩师','我关注的技师','my-therapists'],[MapPin,'服务地址','管理地址信息','addresses'],[Ticket,'优惠券','查看可用优惠','coupons'],[Headphones,'联系客服','在线咨询客服','support']];const funcs=[[Heart,'预约记录','历史服务记录','history'],[Star,'收藏技师','查看喜欢的技师','favorites'],[MessageSquare,'服务评价','分享服务体验','reviews'],[FileText,'健康档案','管理身体需求','health'],[ReceiptText,'发票申请','申请服务发票','invoices'],[Settings,'设置','账号与隐私设置','settings']];return <main><header className="profile-hero"><div className="status"><b>9:41</b><span>▮▮▮ ))) ▰</span></div><h1>我的</h1><p>管理个人信息与服务记录</p><div className="handwrite">放松身心<br/>遇见更好自己</div></header><div className="profile-body"><section className="profile-card"><div className="user"><ImageCrop src="/assets/generated/profile-avatar.png" pos="center"/><div><h2>李女士</h2><button className="phone-copy" onClick={()=>navigator.clipboard?.writeText('13800008888')}>138****8888　<Copy/></button><button className="member" onClick={()=>navigate('/feature/member')}>♛ 轻享会员 <ChevronRight/></button><small>享受专业护理 · 让生活更有温度</small></div><button onClick={()=>navigate('/feature/edit-profile')}>编辑资料 <ChevronRight/></button></div><div className="stats"><button onClick={()=>navigate('/feature/points')}><span><BadgeCheck/></span><p>我的积分<strong>2680</strong></p><ChevronRight/></button><button onClick={()=>navigate('/feature/coupons')}><span><Ticket/></span><p>优惠券<strong>6 <small>张</small></strong></p><ChevronRight/></button></div></section><Dashboard title="我的服务" items={serviceItems}/><Dashboard title="常用功能" items={funcs}/><button className="profile-banner" onClick={()=>navigate('/booking')}><b>放松身心 · 从一次专业护理开始</b><span>舒缓疲惫　焕发活力　让生活更轻松</span><i>立即预约 <ChevronRight/></i></button></div><BottomNav/></main>}

function Dashboard({title,items}){const navigate=useNavigate();return <section className="dashboard"><SectionTitle title={title} onMore={()=>navigate('/feature/'+(title==='我的服务'?'services':'functions'))}/><div>{items.map(([I,t,s,path],idx)=><button onClick={()=>navigate(path==='addresses'?'/addresses':'/feature/'+path)} key={t}><span className={idx%3===1?'orange':''}><I/></span><b>{t}</b><small>{s}</small></button>)}</div></section>}

function OrderPage(){const navigate=useNavigate();const [phoneOpen,setPhoneOpen]=useState(false);const amap='https://uri.amap.com/navigation?to=116.475,39.915,华贸中心&mode=car&policy=1&src=anxiang&coordinate=gaode&callnative=1';return <main className="with-action"><header className="order-hero"><div className="status"><b>9:41</b><span>▮▮▮ ))) ▰</span></div><button onClick={()=>navigate(-1)}><ArrowLeft/></button><h1>订单详情</h1><p>用专业的服务 · 让身心更轻松</p><MiniProgramPill/></header><div className="order-body"><section className="state-card"><span><Check/></span><div><h2>订单已确认</h2><p>按摩师正在按时上门，请保持电话畅通</p></div><b>待服务</b></section><section className="order-card"><h2>服务项目</h2><div className="order-service"><ImageCrop src="/assets/generated/service-neck.png" pos="center"/><div><b>肩颈舒缓按摩</b><small>60分钟</small><div className="tags"><span>缓解肩颈</span><span>放松肌肉</span><span>改善疲劳</span></div></div><strong>¥198<small>x1</small></strong></div><div className="details"><p><span>订单编号</span>DD20240320000123 <Copy/></p><p><span>预约日期</span>2024年03月20日（今天）</p><p><span>服务时间</span>13:00 – 14:00</p></div></section><section className="order-card"><SectionTitle title="按摩师信息" onMore={()=>navigate('/feature/therapist-1')}/><div className="order-person"><ImageCrop src="/assets/generated/therapist-li.png" pos="center"/><div><b>李师傅</b><strong><Star fill="currentColor"/> 5.0</strong><small>3年经验　|　已服务 1200+人</small><span>已接单　 可联系</span></div><button onClick={()=>setPhoneOpen(true)}><Phone/><small>联系师傅</small></button></div></section><section className="order-card"><SectionTitle title="服务地址" onMore={()=>navigate('/addresses')}/><div className="order-address"><MapPin/><div><b>北京市朝阳区 建国路88号 华贸中心 1号楼 1203室</b><small>李先生　138****8888</small></div><a href={amap} target="_blank" rel="noreferrer"><Navigation/>导航</a></div></section><section className="order-card"><h2>费用明细</h2><div className="fees"><p>服务金额 <span>¥198</span></p><p>上门费 <span>¥0</span></p><p>优惠券 <span className="orange">- ¥20</span></p><strong>实付金额 <b>¥178</b></strong></div></section><section className="order-card tips"><h2>温馨提示　ⓘ</h2><ol><li>按摩师将于服务开始前10分钟到达，请保持手机畅通。</li><li>如需取消订单，请至少提前2小时操作，避免产生取消费用。</li><li>服务过程中如有任何不适，请及时与按摩师沟通。</li></ol></section></div>{phoneOpen&&<div className="modal-backdrop" onClick={()=>setPhoneOpen(false)}><div className="call-modal" onClick={e=>e.stopPropagation()}><ImageCrop src="/assets/generated/therapist-li.png" pos="center"/><h3>联系李师傅</h3><p>服务电话：138 0000 6688</p><a href="tel:13800006688"><Phone/>立即拨打</a><button onClick={()=>setPhoneOpen(false)}>取消</button></div></div>}<div className="order-actions"><button onClick={()=>navigate('/feature/support')}><Headphones/> 联系客服</button><button onClick={()=>navigate('/booking')}>再次预约</button></div><BottomNav/></main>}

function SubHeader({title}){const navigate=useNavigate();return <header className="sub-header"><button onClick={()=>navigate(-1)}><ArrowLeft/></button><div><h1>{title}</h1><p>按享到家 · 专业服务更安心</p></div></header>}

function ServicesPage(){const navigate=useNavigate();return <main><SubHeader title="全部服务"/><div className="sub-body"><div className="service-grid">{services.map(s=><ServiceCard service={s} key={s.id} onClick={()=>navigate('/booking?serviceId='+s.id)}/>)}</div></div><BottomNav/></main>}

const featureInfo={
  'new-user':['新人专享','首单立减 30 元','领取优惠券后，下单时可自动抵扣。'],invite:['邀请好友','双方各得 20 元','分享邀请链接，好友完成首单后奖励到账。'],bookings:['我的预约','即将到来的服务','肩颈舒缓按摩 · 今天 13:00'],orders:['我的订单','全部订单','待服务、已完成和已取消订单统一管理'], 'my-therapists':['我的按摩师','关注的按摩师','李师傅 · 评分 5.0 · 可预约'],coupons:['优惠券','6 张可用','新人券 ¥30 · 满减券 ¥20'],support:['联系客服','7×12 小时在线服务','客服电话 400-888-6688'],history:['预约记录','历史服务记录','共完成 12 次上门服务'],favorites:['收藏技师','喜欢的按摩师','收藏后可快速查看档期'],reviews:['服务评价','分享服务体验','你有 1 个订单待评价'],health:['健康档案','管理身体需求','肩颈疲劳 · 睡眠质量一般'],invoices:['发票申请','服务发票管理','可开票金额 ¥576'],settings:['设置','账号与隐私','消息通知 · 隐私设置 · 退出登录'],member:['轻享会员','会员权益','专享折扣 · 优先预约 · 生日礼包'],points:['我的积分','当前积分 2680','每日签到和完成服务可获得积分'], 'edit-profile':['编辑资料','李女士','头像、昵称和联系方式'],services:['我的服务','全部服务入口','预约、订单、按摩师、地址和客服'],functions:['常用功能','便捷服务入口','记录、收藏、评价、档案、发票与设置'], 'all-therapists':['全部按摩师','平台认证技师','支持按服务、距离与评分筛选']
};
function FeaturePage(){const {slug}=useParams();const navigate=useNavigate();const info=featureInfo[slug]||[slug?.startsWith('therapist-')?'按摩师详情':'功能页面','功能已准备','等待后端接口接入'];const isSupport=slug==='support';return <main><SubHeader title={info[0]}/><div className="sub-body"><section className="feature-hero"><span><Leaf/></span><h2>{info[1]}</h2><p>{info[2]}</p></section>{slug==='all-therapists'&&<div className="therapist-grid">{therapists.map(p=><TherapistCard key={p.id} person={p} onClick={()=>navigate('/booking?therapistId='+p.id)}/>)}</div>}{isSupport&&<div className="action-list"><a href="tel:4008886688"><Phone/><div><b>电话客服</b><small>400-888-6688</small></div><ChevronRight/></a><a href="mailto:service@anxiang.example"><MessageSquare/><div><b>在线留言</b><small>service@anxiang.example</small></div><ChevronRight/></a></div>}{!isSupport&&slug!=='all-therapists'&&<div className="action-list"><button onClick={()=>navigate(slug==='new-user'||slug==='coupons'?'/booking':'/profile')}><BadgeCheck/><div><b>{slug==='new-user'?'立即领取':'查看详情'}</b><small>实际数据将在后端接口接入后展示</small></div><ChevronRight/></button></div>}</div><BottomNav/></main>}

function AddressesPage(){const navigate=useNavigate();const fromBooking=new URLSearchParams(location.search).get('select')==='1';const [addresses,setAddresses]=useState(()=>JSON.parse(localStorage.getItem('anxiang_addresses')||'null')||[{id:1,name:'李先生',phone:'138****8888',city:'北京市',district:'朝阳区',detail:'建国路88号 华贸中心 1号楼 1203室',isDefault:true}]);const [adding,setAdding]=useState(false);const initialSel=Number(localStorage.getItem('anxiang_selected_address'))||addresses.find(a=>a.isDefault)?.id||addresses[0]?.id||0;const [selectedId,setSelectedId]=useState(initialSel);const save=(next)=>{setAddresses(next);localStorage.setItem('anxiang_addresses',JSON.stringify(next))};const pick=(id)=>{setSelectedId(id);localStorage.setItem('anxiang_selected_address',id);if(fromBooking)navigate('/booking')};const remove=(a)=>{const next=addresses.filter(x=>x.id!==a.id);save(next);if(selectedId===a.id){const fallback=next.find(x=>x.isDefault)?.id||next[0]?.id||0;setSelectedId(fallback);if(fallback)localStorage.setItem('anxiang_selected_address',fallback);else localStorage.removeItem('anxiang_selected_address')}};const submit=e=>{e.preventDefault();const f=new FormData(e.currentTarget);save([...addresses,{id:Date.now(),name:f.get('name'),phone:f.get('phone'),city:f.get('city'),district:f.get('district'),detail:f.get('detail'),isDefault:false}]);setAdding(false)};return <main><SubHeader title="服务地址"/><div className="sub-body"><p className="addr-pick-tip">点击地址前方的圆圈，勾选为本次服务地址</p>{addresses.map(a=><section className={`saved-address ${selectedId===a.id?'picked':''}`} key={a.id} onClick={()=>pick(a.id)}><span className="saved-check">{selectedId===a.id&&<Check/>}</span><MapPin/><div><b>{a.city}{a.district} {a.detail}</b><small>{a.name}　{a.phone}</small>{a.isDefault&&<em>默认地址</em>}</div><button onClick={e=>{e.stopPropagation();remove(a)}}>删除</button></section>)}{adding?<form className="address-form" onSubmit={submit}><input name="name" required placeholder="联系人"/><input name="phone" required placeholder="手机号"/><div><input name="city" required defaultValue="北京市"/><input name="district" required defaultValue="朝阳区"/></div><input name="detail" required placeholder="详细地址"/><button type="submit">保存地址</button></form>:<button className="primary-wide" onClick={()=>setAdding(true)}>＋ 新增服务地址</button>}</div><BottomNav/></main>}

function App(){return <BrowserRouter><Routes><Route path="/" element={<HomePage/>}/><Route path="/home" element={<HomePage/>}/><Route path="/booking" element={<BookingFlow services={services} therapists={therapists} Hero={Hero} TopSearch={TopSearch} BottomNav={BottomNav} ServiceCard={ServiceCard} TherapistCard={TherapistCard}/>}/><Route path="/booking/date" element={<DatePickerPage/>}/><Route path="/services" element={<ServicesPage/>}/><Route path="/therapists" element={<TherapistsPage/>}/><Route path="/order/:id" element={<PaymentOrderPage BottomNav={BottomNav}/>}/><Route path="/order/:id/track" element={<OrderTrackPage BottomNav={BottomNav}/>}/><Route path="/order/:id/complaint" element={<ComplaintPage BottomNav={BottomNav}/>}/><Route path="/profile" element={<ProfilePage/>}/><Route path="/addresses" element={<AddressesPage/>}/><Route path="/feature/:slug" element={<FeaturePage/>}/></Routes></BrowserRouter>}

createRoot(document.getElementById('root')).render(<App/>);

