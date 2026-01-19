import { memo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/userStore';
import { ArrowRight, Sparkles } from 'lucide-react';
import { formatDisplayName } from '@/lib/utils';

const Home = () => {
  const navigate = useNavigate();
  const userName = useUserStore((state) => state.userName);
  const modulesRef = useRef<HTMLDivElement>(null);

  const scrollToModules = () => {
    modulesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Professional Text-Focused Hero Section */}
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-900 py-20 px-6 sm:px-12 md:py-32 shadow-2xl">
        {/* Subtle Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-violet-500/10 blur-[100px]"></div>
        
        <div className="relative max-w-4xl mx-auto text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Ta'lim Platformasi
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
            Kasbiy transversal <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300">
              kompetensiyalarni rivojlantirish
            </span>
          </h1>
          
          <div className="space-y-6 text-slate-300 text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto">
            <p className="font-semibold text-white/90 text-2xl">
              Assalomu alaykum hurmatli talaba!
            </p>
            <p className="opacity-80">
              Mazkur platforma orqali siz zamonaviy mehnat bozorida eng yuqori talab etiladigan 
              transversal ko'nikmalaringizni rivojlantirishingiz mumkin. Platforma beshta asosiy 
              moduldan tashkil topgan bo‘lib, ular sizning professional salohiyatingizni oshirishga xizmat qiladi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <Button 
              onClick={scrollToModules}
              size="lg"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white h-16 px-10 text-lg font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 cursor-pointer"
            >
              O'rganishni boshlash
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
            <p className="text-slate-500 text-sm font-medium">Interaktiv topshiriqlar va testlar to'plami</p>
          </div>
        </div>
      </section>

      {/* User Welcome Context */}
      {userName && (
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
           <div className="max-w-3xl mx-auto text-center px-4">
              <div className="inline-block p-1 rounded-2xl bg-slate-100 mb-6">
                <div className="px-6 py-2 rounded-xl bg-white shadow-sm border border-slate-200">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Tizimdagi ismingiz:</span>
                  <span className="ml-3 text-sm font-black text-indigo-600">{formatDisplayName(userName)}</span>
                </div>
              </div>
              <p className="text-slate-500 leading-relaxed text-lg font-medium italic">
                "Transversal ko'nikmalar nafaqat ishda, balki hayotda ham muvaffaqiyat garovidir."
              </p>
           </div>
        </section>
      )}

      {/* Modules Section */}
      <section ref={modulesRef} className="space-y-16 px-4">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">O'quv Modullari</h2>
          <div className="h-1.5 w-24 bg-indigo-600 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Module 1 */}
          <Card 
            className="group cursor-pointer transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-3 border-slate-200 rounded-3xl overflow-hidden flex flex-col min-h-[320px]"
            onClick={() => navigate('/module/1/task/1')}
          >
            <div className="h-3 bg-indigo-600" />
            <CardHeader className="space-y-6 pb-0 pt-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 font-black text-2xl transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white">
                1
              </div>
              <CardTitle className="text-2xl font-black text-slate-900 leading-tight">
                Tanqidiy va innovatsion fikrlash
              </CardTitle>
            </CardHeader>
            <CardContent className="mt-6 flex flex-col flex-1 justify-between gap-8 pb-8">
              <CardDescription className="text-slate-500 text-base leading-relaxed font-medium">
                Ma'lumotni tahlil qilish, savol berish, dalillarni solishtirish va innovatsion yechimlar topish.
              </CardDescription>
              <div className="flex items-center text-indigo-600 font-bold text-sm">
                Kirish <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
              </div>
            </CardContent>
          </Card>

          {/* Module 2 */}
          <Card 
            className="group cursor-pointer transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-3 border-slate-200 rounded-3xl overflow-hidden flex flex-col min-h-[320px]"
            onClick={() => navigate('/module/2/task/1')}
          >
            <div className="h-3 bg-emerald-500" />
            <CardHeader className="space-y-6 pb-0 pt-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-black text-2xl transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                2
              </div>
              <CardTitle className="text-2xl font-black text-slate-900 leading-tight">
                Shaxslararo ko‘nikmalar
              </CardTitle>
            </CardHeader>
            <CardContent className="mt-6 flex flex-col flex-1 justify-between gap-8 pb-8">
              <CardDescription className="text-slate-500 text-base leading-relaxed font-medium">
                Muloqot madaniyati, empatiya, aktiv tinglash va jamoaviy hamkorlik.
              </CardDescription>
              <div className="flex items-center text-emerald-600 font-bold text-sm">
                Kirish <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
              </div>
            </CardContent>
          </Card>

          {/* Module 3 */}
          <Card 
            className="group cursor-pointer transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-3 border-slate-200 rounded-3xl overflow-hidden flex flex-col min-h-[320px]"
            onClick={() => navigate('/module/3/task/1')}
          >
            <div className="h-3 bg-amber-500" />
            <CardHeader className="space-y-6 pb-0 pt-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 font-black text-2xl transition-all duration-300 group-hover:bg-amber-600 group-hover:text-white">
                3
              </div>
              <CardTitle className="text-2xl font-black text-slate-900 leading-tight">
                Shaxsiy qobiliyatlar
              </CardTitle>
            </CardHeader>
            <CardContent className="mt-6 flex flex-col flex-1 justify-between gap-8 pb-8">
              <CardDescription className="text-slate-500 text-base leading-relaxed font-medium">
                Emotsional intellekt, o'z-o'zini boshqarish va stressga chidamlilik ko'nikmalari.
              </CardDescription>
              <div className="flex items-center text-amber-600 font-bold text-sm">
                Kirish <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
              </div>
            </CardContent>
          </Card>

          {/* Module 4 */}
          <Card 
            className="group cursor-pointer transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-3 border-slate-200 rounded-3xl overflow-hidden flex flex-col min-h-[320px]"
            onClick={() => navigate('/module/4/task/1')}
          >
            <div className="h-3 bg-indigo-400" />
            <CardHeader className="space-y-6 pb-0 pt-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-400 font-black text-2xl transition-all duration-300 group-hover:bg-indigo-400 group-hover:text-white">
                4
              </div>
              <CardTitle className="text-2xl font-black text-slate-900 leading-tight">
                Global fuqarolik
              </CardTitle>
            </CardHeader>
            <CardContent className="mt-6 flex flex-col flex-1 justify-between gap-8 pb-8">
              <CardDescription className="text-slate-500 text-base leading-relaxed font-medium">
                Madaniyatlararo muloqot va barqaror rivojlanish tamoyillari.
              </CardDescription>
              <div className="flex items-center text-indigo-400 font-bold text-sm">
                Kirish <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
              </div>
            </CardContent>
          </Card>

          {/* Module 5 */}
          <Card 
            className="group cursor-pointer transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-3 border-slate-200 rounded-3xl overflow-hidden flex flex-col min-h-[320px]"
            onClick={() => navigate('/module/5/task/1')}
          >
            <div className="h-3 bg-cyan-500" />
            <CardHeader className="space-y-6 pb-0 pt-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 font-black text-2xl transition-all duration-300 group-hover:bg-cyan-600 group-hover:text-white">
                5
              </div>
              <CardTitle className="text-2xl font-black text-slate-900 leading-tight">
                Media va axborot savodxonligi
              </CardTitle>
            </CardHeader>
            <CardContent className="mt-6 flex flex-col flex-1 justify-between gap-8 pb-8">
              <CardDescription className="text-slate-500 text-base leading-relaxed font-medium">
                Axborot bilan ishlash, tahlil qilish va raqamli xavfsizlik madaniyati.
              </CardDescription>
              <div className="flex items-center text-cyan-600 font-bold text-sm">
                Kirish <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default memo(Home);

