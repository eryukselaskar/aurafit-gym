import type { Exercise, WorkoutProgram, CompletedWorkout, WeightLog, PersonalRecord } from '../types';

export const INITIAL_EXERCISES: Exercise[] = [
  // Göğüs (Chest)
  { id: 'ex-1', name: 'Incline Dumbbell Press', category: 'Göğüs', description: 'Üst göğüs liflerini hedefleyen dambıl pres egzersizi.' },
  { id: 'ex-2', name: 'Barbell Bench Press', category: 'Göğüs', description: 'Temel bileşik göğüs egzersizi. Tüm göğsü uyarır.' },
  { id: 'ex-3', name: 'Cable Crossover', category: 'Göğüs', description: 'Göğüs iç ve alt liflerini sıkıştırmak için kablolu egzersiz.' },
  { id: 'ex-18', name: 'Dumbbell Bench Press', category: 'Göğüs', description: 'Dambıllar ile yapılan yatay göğüs presi. Hareket mesafesi barbelle göre daha uzundur.' },
  { id: 'ex-19', name: 'Incline Barbell Bench Press', category: 'Göğüs', description: 'Eğik sehpada üst göğüs kaslarını hedefleyen barbell pres hareketi.' },
  { id: 'ex-20', name: 'Dumbbell Fly', category: 'Göğüs', description: 'Göğüs kaslarını açarak esnetme odaklı izole dambıl hareketi.' },
  { id: 'ex-21', name: 'Chest Press Machine', category: 'Göğüs', description: 'Makinede güvenli göğüs presi. Stabilizasyon gerektirmez.' },
  { id: 'ex-22', name: 'Pec Deck Fly (Butterfly)', category: 'Göğüs', description: 'Kelebek makinesinde göğüs kaslarını içe doğru sıkıştırma egzersizi.' },
  { id: 'ex-23', name: 'Push Up (Şınav)', category: 'Göğüs', description: 'Vücut ağırlığıyla yapılan temel göğüs ve triceps hareketi.' },
  { id: 'ex-24', name: 'Chest Dips', category: 'Göğüs', description: 'Paralel barlarda vücudu öne eğerek alt göğüs kaslarını hedefleyen dips hareketi.' },

  // Sırt (Back)
  { id: 'ex-4', name: 'Lat Pulldown', category: 'Sırt', description: 'Sırt genişliği ve kanat kasları için çekiş egzersizi.' },
  { id: 'ex-5', name: 'Barbell Row', category: 'Sırt', description: 'Sırt kalınlığı ve orta sırt için ağır barbell çekişi.' },
  { id: 'ex-6', name: 'Pull Up (Barfiks)', category: 'Sırt', description: 'Vücut ağırlığıyla yapılan temel sırt egzersizi.' },
  { id: 'ex-25', name: 'Deadlift (Conventional)', category: 'Sırt', description: 'Tüm arka zincir kaslarını (bel, sırt, bacak) çalıştıran temel bileşik güç hareketi.' },
  { id: 'ex-26', name: 'One Arm Dumbbell Row', category: 'Sırt', description: 'Tek dambıl ile sehpada yapılan sırt ve kanat odaklı çekiş egzersizi.' },
  { id: 'ex-27', name: 'T-Bar Row', category: 'Sırt', description: 'T-bar düzeneğiyle yapılan, orta sırtı kalınlaştıran yoğun çekiş hareketi.' },
  { id: 'ex-28', name: 'Seated Cable Row', category: 'Sırt', description: 'Kablolu makinede oturarak karna doğru yapılan kürek hareketi.' },
  { id: 'ex-29', name: 'Hyperextension (Ters Mekik)', category: 'Sırt', description: 'Bel kaslarını ve arka bacağı güçlendiren izole uzanma hareketi.' },
  { id: 'ex-30', name: 'Straight Arm Pulldown', category: 'Sırt', description: 'Kabloda düz kollarla aşağı çekiş. Kanat kaslarını izole eder.' },
  { id: 'ex-31', name: 'Dumbbell Shrug', category: 'Sırt', description: 'Dambıllarla omuz silkme hareketi. Trapez kaslarını hedefler.' },

  // Bacak (Legs)
  { id: 'ex-7', name: 'Barbell Back Squat', category: 'Bacak', description: 'Kuadriseps, kalça ve hamstring kasları için kral egzersiz.' },
  { id: 'ex-8', name: 'Romanian Deadlift', category: 'Bacak', description: 'Hamstring (arka bacak) ve kalça kaslarını hedefleyen deadlift varyasyonu.' },
  { id: 'ex-9', name: 'Leg Press', category: 'Bacak', description: 'Makinede bacak itişi ile güvenli kuadriseps uyarımı.' },
  { id: 'ex-32', name: 'Goblet Squat', category: 'Bacak', description: 'Göğüs hizasında dambıl tutarak yapılan squat. Core bölgesini de aktif eder.' },
  { id: 'ex-33', name: 'Leg Extension', category: 'Bacak', description: 'Ön bacak kaslarını (quadriceps) izole olarak çalıştıran açma hareketi.' },
  { id: 'ex-34', name: 'Lying Leg Curl', category: 'Bacak', description: 'Yatarak arka bacak kaslarını (hamstrings) büken makine egzersizi.' },
  { id: 'ex-35', name: 'Dumbbell Walking Lunge', category: 'Bacak', description: 'Adım atarak yapılan, denge ve bacak kaslarını güçlendiren dambıl hareketi.' },
  { id: 'ex-36', name: 'Bulgarian Split Squat', category: 'Bacak', description: 'Arka ayağı sehpaya koyarak tek bacakla yapılan yoğun squat varyasyonu.' },
  { id: 'ex-37', name: 'Hip Thrust', category: 'Bacak', description: 'Kalça kaslarını (glutes) en üst seviyede uyaran kalça köprüsü hareketi.' },
  { id: 'ex-38', name: 'Standing Calf Raise', category: 'Bacak', description: 'Ayakta parmak ucuna yükselme egzersizi. Baldır kaslarını çalıştırır.' },

  // Omuz (Shoulders)
  { id: 'ex-10', name: 'Overhead Press', category: 'Omuz', description: 'Omuz başları ve triceps için temel başüstü barbell presi.' },
  { id: 'ex-11', name: 'Lateral Raise', category: 'Omuz', description: 'Yan omuz başlarını genişletmek ve omuzlara 3D form vermek için.' },
  { id: 'ex-12', name: 'Face Pull', category: 'Omuz', description: 'Arka omuz ve rotatör manşet sağlığı için mükemmel egzersiz.' },
  { id: 'ex-39', name: 'Arnold Press', category: 'Omuz', description: 'Dambılları çevirerek yapılan, omuzun ön ve yan başlarını uyaran pres.' },
  { id: 'ex-40', name: 'Dumbbell Front Raise', category: 'Omuz', description: 'Omuzun ön kısmını hedefleyen dambıl öne kaldırma hareketi.' },
  { id: 'ex-41', name: 'Rear Delt Fly', category: 'Omuz', description: 'Omuz arkasını hedefleyen eğilerek dambıl açış hareketi.' },
  { id: 'ex-42', name: 'Upright Row', category: 'Omuz', description: 'Barbell veya kablo ile çeneye çekiş. Yan omuz ve trapezleri çalıştırır.' },

  // Kol (Arms)
  { id: 'ex-13', name: 'Dumbbell Bicep Curl', category: 'Kol', description: 'Biceps (ön kol) kaslarını izole eden dambıl büküşü.' },
  { id: 'ex-14', name: 'Tricep Rope Pushdown', category: 'Kol', description: 'Kabloda halat ile triceps (arka kol) sıkıştırma egzersizi.' },
  { id: 'ex-15', name: 'Hammer Curl', category: 'Kol', description: 'Brachialis ve ön kol kaslarını güçlendiren çekiç büküşü.' },
  { id: 'ex-43', name: 'EZ-Bar Bicep Curl', category: 'Kol', description: 'Z-bar kullanarak yapılan bilek dostu bicep curl egzersizi.' },
  { id: 'ex-44', name: 'Preacher Curl', category: 'Kol', description: 'Sehpada dirsekleri sabitleyerek yapılan izole bicep büküş hareketi.' },
  { id: 'ex-45', name: 'Concentration Curl', category: 'Kol', description: 'Oturarak dirseği dize dayayıp yapılan tepe noktası odaklı curl egzersizi.' },
  { id: 'ex-46', name: 'Lying Skullcrusher', category: 'Kol', description: 'Alna doğru Z-bar indirerek yapılan temel triceps egzersizi.' },
  { id: 'ex-47', name: 'Overhead Dumbbell Extension', category: 'Kol', description: 'Baş arkasından tek dambıl çift elle yukarı itiş. Triceps uzun başını çalıştırır.' },
  { id: 'ex-48', name: 'Bench Dips', category: 'Kol', description: 'Sehpa kenarında vücut ağırlığıyla yapılan arka kol itiş hareketi.' },
  { id: 'ex-49', name: 'Close Grip Bench Press', category: 'Kol', description: 'Dar tutuş bench press. Göğüs ile birlikte triceps gücünü geliştirir.' },

  // Karın (Core)
  { id: 'ex-16', name: 'Hanging Leg Raise', category: 'Karın', description: 'Barfiks barında asılarak yapılan alt karın egzersizi.' },
  { id: 'ex-17', name: 'Plank', category: 'Karın', description: 'Tüm core bölgesini ve izometrik dayanıklılığı güçlendirir.' },
  { id: 'ex-50', name: 'Crunch (Mekik)', category: 'Karın', description: 'Üst karın kaslarını sıkıştıran temel gövde bükme hareketi.' },
  { id: 'ex-51', name: 'Russian Twist', category: 'Karın', description: 'Gövdeyi sağa sola döndürerek yan karın (oblik) kaslarını çalıştıran egzersiz.' },
  { id: 'ex-52', name: 'Cable Crunch', category: 'Karın', description: 'Diz üstünde kablo yardımıyla ağırlıklı olarak yapılan mekik hareketi.' },
  { id: 'ex-53', name: 'Ab Wheel Rollout', category: 'Karın', description: 'Karın tekerleği ile öne uzanarak yapılan ileri düzey core egzersizi.' },
  { id: 'ex-54', name: 'Bicycle Crunch', category: 'Karın', description: 'Pedal çevirme hareketiyle oblikleri ve alt karnı çalıştıran egzersiz.' },

  // Kardiyo (Cardio)
  { id: 'ex-55', name: 'Treadmill Running (Koşu)', category: 'Kardiyo', description: 'Koşu bandında veya açık havada dayanıklılık ve kalori yakım koşusu.' },
  { id: 'ex-56', name: 'Stationary Cycling (Bisiklet)', category: 'Kardiyo', description: 'Kondisyon bisikletinde düşük veya yüksek yoğunluklu kardiyo antrenmanı.' },
  { id: 'ex-57', name: 'Rowing Machine (Kürek)', category: 'Kardiyo', description: 'Kürek çekme simülatöründe tüm vücudu çalıştıran kardiyo hareketi.' },
  { id: 'ex-58', name: 'Jump Rope (İp Atlama)', category: 'Kardiyo', description: 'Hızlı ayak hareketleri ve koordinasyon geliştiren ip atlama.' },
  { id: 'ex-59', name: 'Elliptical Trainer (Eliptik)', category: 'Kardiyo', description: 'Eklemlere yük bindirmeden tüm vücudu aktif eden kardiyo makinesi.' },
  { id: 'ex-60', name: 'Stair Master', category: 'Kardiyo', description: 'Sürekli merdiven çıkma simülatörü. Yoğun bacak uyarımı ve kardiyo sağlar.' },
  { id: 'ex-61', name: 'Burpee', category: 'Kardiyo', description: 'Şınav, squat ve sıçramayı birleştiren yüksek yoğunluklu tüm vücut egzersizi.' },

  // Göğüs (Chest) - Ek
  { id: 'ex-62', name: 'Decline Barbell Bench Press', category: 'Göğüs', description: 'Alt göğüs liflerini hedefleyen aşağı eğimli barbell bench press.' },
  { id: 'ex-63', name: 'Decline Dumbbell Bench Press', category: 'Göğüs', description: 'Alt göğüs lifleri için dambıllar ile yapılan aşağı eğimli pres.' },
  { id: 'ex-64', name: 'Cable Fly', category: 'Göğüs', description: 'Kablo makinesinde göğüs kaslarını sıkıştırma odaklı izole egzersiz.' },
  { id: 'ex-65', name: 'Landmine Press', category: 'Göğüs', description: 'Smith barı veya serbest barın köşesiyle yapılan üst göğüs ve ön omuz presi.' },

  // Sırt (Back) - Ek
  { id: 'ex-66', name: 'Chin Up', category: 'Sırt', description: 'Avuç içleri içe bakacak şekilde yapılan barfiks varyasyonu. Bicepsleri de yoğun çalıştırır.' },
  { id: 'ex-67', name: 'Rack Pull', category: 'Sırt', description: 'Güç kafesinde kaval kemiği hizasından başlanarak yapılan yarım deadlift. Üst sırt ve beli hedefler.' },
  { id: 'ex-68', name: 'Close Grip Lat Pulldown', category: 'Sırt', description: 'Dar nötral tutuş aparatı ile göğse çekiş. Alt kanat liflerini hedefler.' },
  { id: 'ex-69', name: 'Inverted Row', category: 'Sırt', description: 'Bar altında kendi vücut ağırlığını yukarı çekerek yapılan sırt egzersizi.' },
  { id: 'ex-70', name: 'Kelso Row', category: 'Sırt', description: 'Eğilerek kürek kemiklerini (scapula) birleştirerek yapılan trapez ve orta sırt hareketi.' },

  // Bacak (Legs) - Ek
  { id: 'ex-71', name: 'Front Squat', category: 'Bacak', description: 'Barbelli ön omuzlarda tutarak yapılan squat. Kuadriseps ve core kaslarını daha fazla hedefler.' },
  { id: 'ex-72', name: 'Leg Press Calf Raise', category: 'Bacak', description: 'Leg press makinesinde sadece ayak parmak uçlarıyla yapılan kalf sıkıştırma hareketi.' },
  { id: 'ex-73', name: 'Seated Calf Raise Machine', category: 'Bacak', description: 'Oturarak kalf makinesinde yapılan, soleus kalf kasını hedefleyen egzersiz.' },
  { id: 'ex-74', name: 'Hack Squat Machine', category: 'Bacak', description: 'Hack squat makinesinde yapılan, ön bacak liflerini izole eden yoğun çömelme egzersizi.' },
  { id: 'ex-75', name: 'Sumo Deadlift', category: 'Bacak', description: 'Geniş ayak duruşuyla yapılan deadlift. Kalça, iç bacak ve arka zinciri çalıştırır.' },
  { id: 'ex-76', name: 'Glute Ham Raise (GHR)', category: 'Bacak', description: 'GHR sehpası üzerinde diz bükerek vücudu yukarı çekme. Yoğun arka bacak ve kalça uyarımı sağlar.' },
  { id: 'ex-77', name: 'Dumbbell Step Up', category: 'Bacak', description: 'Elde dambıllar ile kutuya veya sehpaya tek bacakla adım atarak yükselme hareketi.' },

  // Omuz (Shoulders) - Ek
  { id: 'ex-78', name: 'Seated Dumbbell Lateral Raise', category: 'Omuz', description: 'Oturarak yan omuz başlarını izole eden dambıl yana açış egzersizi.' },
  { id: 'ex-79', name: 'Cable Front Raise', category: 'Omuz', description: 'Kablo makinesinde öne kaldırma hareketi. Ön omuz liflerini izole eder.' },
  { id: 'ex-80', name: 'Behind the Neck Press', category: 'Omuz', description: 'Enseye doğru indirilen barbell omuz pres. Esneklik ve omuz gücü gerektirir.' },
  { id: 'ex-81', name: 'Incline Y-Raise', category: 'Omuz', description: 'Eğik sehpada yüzüstü yatarak dambılları Y şeklinde kaldırma. Alt trapez ve yan omuz hedeflenir.' },
  { id: 'ex-82', name: 'Dumbbell Rear Delt Row', category: 'Omuz', description: 'Dirsekleri dışarı açarak dambılları çekiş. Arka omuz kaslarını kalınlaştırır.' },

  // Kol (Arms) - Ek
  { id: 'ex-83', name: 'Incline Dumbbell Bicep Curl', category: 'Kol', description: 'Eğik sehpada sırtüstü uzanarak yapılan bicep curl. Bicepsin uzun başını yüksek seviyede esnetir.' },
  { id: 'ex-84', name: 'Cable Bicep Curl (Straight Bar)', category: 'Kol', description: 'Kablo makinesinde düz bar yardımıyla yapılan sürekli dirençli ön kol büküşü.' },
  { id: 'ex-85', name: 'Spider Curl (EZ Bar)', category: 'Kol', description: 'Eğik sehpaya yüzüstü yaslanıp kollar aşağı sarkık pozisyonda yapılan bicep curl.' },
  { id: 'ex-86', name: 'Cable Tricep Overhead Extension', category: 'Kol', description: 'Kabloda baş arkasından halat ile yukarı doğru itiş. Arka kolun uzun başını hedefler.' },
  { id: 'ex-87', name: 'Overhead EZ-Bar Tricep Extension', category: 'Kol', description: 'Ayakta veya oturarak Z-bar yardımıyla baş arkasından tricep uzatma hareketi.' },
  { id: 'ex-88', name: 'Reverse Grip Cable Pushdown', category: 'Kol', description: 'Kabloda ters tutuş (avuç içleri yukarı) yapılan tricep pushdown.' },
  { id: 'ex-89', name: 'Reverse EZ-Bar Bicep Curl', category: 'Kol', description: 'Z-bar ile ters tutuş bicep curl. Ön kol (brachioradialis) kaslarını hedefler.' },
  { id: 'ex-90', name: 'Barbell Wrist Curl', category: 'Kol', description: 'Bilekleri sehpaya dayayıp barbelli yukarı bükerek yapılan alt kol (wrist flexor) egzersizi.' },
  { id: 'ex-91', name: 'Barbell Reverse Wrist Curl', category: 'Kol', description: 'Bilekleri sehpaya dayayıp barbelli yukarı ters bükerek yapılan üst bilek egzersizi.' },

  // Karın (Core) - Ek
  { id: 'ex-92', name: 'Side Plank', category: 'Karın', description: 'Dirsek üzerinde yan durarak yapılan izometrik core egzersizi. Yan karın kaslarını güçlendirir.' },
  { id: 'ex-93', name: 'Cable Woodchopper', category: 'Karın', description: 'Kablo makinesinde çapraz aşağıya doğru gövde rotasyonu. Oblikleri hedefler.' },
  { id: 'ex-94', name: 'Hanging Knee Raise', category: 'Karın', description: 'Barfiks barında asılı kalarak dizleri göğse çekme hareketi. Alt karın odaklıdır.' },
  { id: 'ex-95', name: 'Toes to Bar', category: 'Karın', description: 'Barfiks barında asılarak ayak parmak uçlarını bara değdirme egzersizi.' },
  { id: 'ex-96', name: 'Bird Dog', category: 'Karın', description: 'Emekleme pozisyonunda çapraz kol ve bacağı uzatarak omurga stabilitesini sağlama hareketi.' },
  { id: 'ex-97', name: 'Dead Bug', category: 'Karın', description: 'Sırtüstü yatarak çapraz kol ve bacak koordinasyonuyla yapılan bel koruma odaklı core hareketi.' },

  // Kardiyo (Cardio) - Ek
  { id: 'ex-98', name: 'Kettlebell Swing', category: 'Kardiyo', description: 'Kettlebelli bacak arasından omuz hizasına sallama. Kalça gücü ve kardiyovasküler kapasite geliştirir.' },
  { id: 'ex-99', name: 'Battle Ropes', category: 'Kardiyo', description: 'Ağır halatları dalgalandırarak yapılan yüksek yoğunluklu kondisyon egzersizi.' },
  { id: 'ex-100', name: 'Assault Bike (Air Bike)', category: 'Kardiyo', description: 'Hava direnciyle çalışan kondisyon bisikleti. Tüm vücut kardiyo ve kondisyon sağlar.' },
  { id: 'ex-101', name: 'Sled Push (Kızak İtme)', category: 'Kardiyo', description: 'Ağırlık yüklü kızağı zeminde itme. Bacak gücü ve anaerobik dayanıklılık hedefler.' },
  { id: 'ex-102', name: 'Mountain Climbers', category: 'Kardiyo', description: 'Şınav pozisyonunda dizleri hızlıca karna çekerek yapılan kardiyo hareketi.' },

  // Free Exercise DB - Eklemeler
  { id: 'ex-103', name: '3/4 Sit-Up', category: 'Karın', description: 'Karın kaslarını hedefleyen, tam doğrulmadan yapılan yarım mekik hareketi.' },
  { id: 'ex-104', name: 'Ab Crunch Machine', category: 'Karın', description: 'Karın egzersiz makinesinde ağırlık direnciyle yapılan sıkıştırma egzersizi.' },
  { id: 'ex-105', name: 'Alternate Hammer Curl', category: 'Kol', description: 'Ayakta sırasıyla tek tek yapılan dambıl çekiç büküşü (hammer curl).' },
  { id: 'ex-106', name: 'Alternate Incline Dumbbell Curl', category: 'Kol', description: 'Eğik sehpada sırasıyla sağ ve sol kolla yapılan izole ön kol büküşü.' },
  { id: 'ex-107', name: 'Alternating Cable Shoulder Press', category: 'Omuz', description: 'Kablo makinesinde sırayla tek tek yapılan başüstü omuz presi.' },
  { id: 'ex-108', name: 'Alternating Deltoid Raise', category: 'Omuz', description: 'Dambıllarla sırasıyla sağ ve sol kolla yapılan omuz yana/öne açış hareketi.' },
  { id: 'ex-109', name: 'Alternating Renegade Row', category: 'Sırt', description: 'Şınav pozisyonunda dambılları sırayla yukarı çekerek yapılan sırt ve core egzersizi.' },
  { id: 'ex-110', name: 'Dumbbell Around The World', category: 'Omuz', description: 'Sırtüstü veya ayakta dambılları dairesel olarak çevirerek tüm omuz ve üst göğsü çalıştıran hareket.' },
  { id: 'ex-111', name: 'Band Assisted Pull-Up', category: 'Sırt', description: 'Direnç bandı desteğiyle yapılan barfiks egzersizi.' },
  { id: 'ex-112', name: 'Band Skull Crusher', category: 'Kol', description: 'Direnç bandı yardımıyla yapılan arka kol (triceps) uzatma hareketi.' },
  { id: 'ex-113', name: 'Barbell Ab Rollout - On Knees', category: 'Karın', description: 'Diz üstünde barbell yardımıyla öne doğru uzanarak yapılan yoğun karın egzersizi.' },
  { id: 'ex-114', name: 'Barbell Guillotine Bench Press', category: 'Göğüs', description: 'Barı boyun hizasına indirerek yapılan göğüs kaslarını maksimum esneten bench press varyasyonu.' },
  { id: 'ex-115', name: 'Barbell Shrug Behind The Back', category: 'Sırt', description: 'Barbelli vücudun arkasında tutarak yapılan üst trapez omuz silkme egzersizi.' },
  { id: 'ex-116', name: 'Barbell Side Bend', category: 'Karın', description: 'Barbell sırttayken yana eğilerek yapılan yan karın (oblik) egzersizi.' },
  { id: 'ex-117', name: 'Box Squat', category: 'Bacak', description: 'Arkadaki kutu veya sehpaya oturup kalkarak yapılan squat varyasyonu.' },
  { id: 'ex-118', name: 'Cable Chest Press', category: 'Göğüs', description: 'Kablo makinesinde ayakta veya oturarak yapılan göğüs presi.' },
  { id: 'ex-119', name: 'Cable Hammer Curls - Rope', category: 'Kol', description: 'Kablo makinesinde halat aparatı ile yapılan çekiç büküşü ön kol hareketi.' },
  { id: 'ex-120', name: 'Cable Internal Rotation', category: 'Omuz', description: 'Kablo yardımıyla kolu içe doğru döndürerek yapılan rotatör manşet güçlendirme egzersizi.' },
  { id: 'ex-121', name: 'Cable Lying Triceps Extension', category: 'Kol', description: 'Sehpada yatarak kablo makinesinde yapılan alna press (triceps extension) hareketi.' },
  { id: 'ex-122', name: 'Cable Preacher Curl', category: 'Kol', description: 'Preacher sehpasında kablo çekişi ile yapılan izole ön kol büküşü.' },
  { id: 'ex-123', name: 'Cable Seated Lateral Raise', category: 'Omuz', description: 'Oturarak kablo makinesinde yapılan omuz yana açış egzersizi.' },
  { id: 'ex-124', name: 'Cable Wrist Curl', category: 'Kol', description: 'Kablo makinesinde yapılan ön kol (bilek bükme) egzersizi.' },
  { id: 'ex-125', name: 'Crucifix Hold', category: 'Omuz', description: 'Dambılları omuz hizasında yana doğru düz tutarak yapılan statik omuz dayanıklılık hareketi.' },
  { id: 'ex-126', name: 'Decline EZ Bar Triceps Extension', category: 'Kol', description: 'Aşağı eğimli sehpada Z-bar ile yapılan triceps extension (alna press).' },
  { id: 'ex-127', name: 'Decline Oblique Crunch', category: 'Karın', description: 'Aşağı eğimli sehpada yan karın kaslarını hedefleyen mekik hareketi.' },
  { id: 'ex-128', name: 'Decline Push-Up', category: 'Göğüs', description: 'Ayaklar yüksekte (sehpa üzerinde) yapılan, üst göğüs ve ön omuzu hedefleyen şınav.' },
  { id: 'ex-129', name: 'Deficit Deadlift', category: 'Bacak', description: 'Kuvvet platformu veya plaka üzerinde durarak daha derin mesafeden yapılan deadlift.' },
  { id: 'ex-130', name: 'Donkey Calf Raise', category: 'Bacak', description: 'Öne eğilerek (sırt ağırlıklı veya makinede) yapılan kalf (baldır) kaldırma egzersizi.' },
  { id: 'ex-131', name: 'Drag Curl', category: 'Kol', description: 'Barı vücuda sürterek dirsekleri arkaya çekerek yapılan tepe noktası odaklı ön kol hareketi.' },
  { id: 'ex-132', name: 'EZ-Bar Skullcrusher', category: 'Kol', description: 'Z-bar kullanarak sehpada yatarak yapılan arka kol alna press egzersizi.' }
];

export const INITIAL_PROGRAMS: WorkoutProgram[] = [
  {
    id: 'prog-ppl-bundle',
    name: 'Push Pull Legs Upper Lower (5 Days)',
    description: 'Haftalık 5 günlük profesyonel hipertrofi ve güç programı.',
    createdAt: new Date().toISOString(),
    exercises: [], // empty for bundle program
    sessions: [
      {
        id: 'sess-1',
        name: 'PAZARTESİ  —  Push (Göğüs & Triceps)',
        exercises: [
          {
            id: 'we-ppl-1',
            exerciseId: 'ex-19',
            name: 'Incline Chest Press (Smith Machine)',
            category: 'Göğüs',
            restTime: 120,
            notes: 'RIR 1 — duraksamalı. Spotter gerektirmez. Barı göğüs üstüne kontrollü indir, patlat.',
            minReps: 6,
            maxReps: 10,
            sets: [
              { id: 's-ppl-1', reps: 10, weight: 50, rir: 1, completed: false },
              { id: 's-ppl-2', reps: 10, weight: 50, rir: 1, completed: false },
              { id: 's-ppl-3', reps: 10, weight: 50, rir: 1, completed: false }
            ]
          },
          {
            id: 'we-ppl-2',
            exerciseId: 'ex-22',
            name: 'Chest Fly (Makine)',
            category: 'Göğüs',
            restTime: 75,
            notes: 'RIR 0 — ortada 1 sn sıkıştır. Göğüs izole.',
            minReps: 6,
            maxReps: 12,
            sets: [
              { id: 's-ppl-4', reps: 12, weight: 0, rir: 0, completed: false },
              { id: 's-ppl-5', reps: 10, weight: 0, rir: 0, completed: false }
            ]
          },
          {
            id: 'we-ppl-3',
            exerciseId: 'ex-11',
            name: 'Cable Lateral Raise (Tek Kol)',
            category: 'Omuz',
            restTime: 60,
            notes: 'RIR 0 — oturarak, momentumsuz. Önce sol kolla başla, zayıf kol kuralı.',
            minReps: 6,
            maxReps: 12,
            sets: [
              { id: 's-ppl-6', reps: 12, weight: 10, rir: 0, completed: false },
              { id: 's-ppl-7', reps: 10, weight: 10, rir: 0, completed: false },
              { id: 's-ppl-8', reps: 10, weight: 10, rir: 0, completed: false }
            ]
          },
          {
            id: 'we-ppl-4',
            exerciseId: 'ex-14',
            name: 'Tricep Pushdown (Tek Kol Cable)',
            category: 'Kol',
            restTime: 60,
            notes: 'RIR 0 — dirseği vücuda yapıştır, sadece ön kol hareket eder.',
            minReps: 6,
            maxReps: 12,
            sets: [
              { id: 's-ppl-9', reps: 12, weight: 10, rir: 0, completed: false },
              { id: 's-ppl-10', reps: 10, weight: 10, rir: 0, completed: false }
            ]
          },
          {
            id: 'we-ppl-5',
            exerciseId: 'ex-47',
            name: 'Overhead Triceps (Tek Kol Cable)',
            category: 'Kol',
            restTime: 60,
            notes: 'RIR 0 — dirsek sabit, tam uzat. Uzun baş izole.',
            minReps: 6,
            maxReps: 12,
            sets: [
              { id: 's-ppl-11', reps: 12, weight: 10, rir: 0, completed: false },
              { id: 's-ppl-12', reps: 10, weight: 10, rir: 0, completed: false }
            ]
          }
        ]
      },
      {
        id: 'sess-2',
        name: 'SALI  —  Pull (Sırt & Biceps)',
        exercises: [
          {
            id: 'we-ppl-6',
            exerciseId: 'ex-4',
            name: 'Supinated Lat Pulldown',
            category: 'Sırt',
            restTime: 90,
            notes: 'RIR 1 — alt lat odağı. Barı göğse değdir, sırtla çek. Tek kol 2 set, çift kol 3 set.',
            minReps: 6,
            maxReps: 10,
            sets: [
              { id: 's-ppl-13', reps: 10, weight: 70, rir: 1, completed: false },
              { id: 's-ppl-14', reps: 8, weight: 70, rir: 1, completed: false },
              { id: 's-ppl-15', reps: 8, weight: 70, rir: 1, completed: false }
            ]
          },
          {
            id: 'we-ppl-7',
            exerciseId: 'ex-28',
            name: 'Geniş Tutuş Seated Cable Row',
            category: 'Sırt',
            restTime: 90,
            notes: 'RIR 0 — üst sırt odağı. Göğüs destekli / T-bar alternatif. Kürek kemiklerini sıkıştır.',
            minReps: 6,
            maxReps: 10,
            sets: [
              { id: 's-ppl-16', reps: 10, weight: 45, rir: 0, completed: false },
              { id: 's-ppl-17', reps: 8, weight: 45, rir: 0, completed: false }
            ]
          },
          {
            id: 'we-ppl-8',
            exerciseId: 'ex-28',
            name: 'V-Bar Seated Cable Row',
            category: 'Sırt',
            restTime: 90,
            notes: 'RIR 0 — nötral tutuş, orta sırt odağı. Hareketi sırtla yap, kollarla değil.',
            minReps: 6,
            maxReps: 10,
            sets: [
              { id: 's-ppl-18', reps: 10, weight: 45, rir: 0, completed: false },
              { id: 's-ppl-19', reps: 8, weight: 45, rir: 0, completed: false }
            ]
          },
          {
            id: 'we-ppl-9',
            exerciseId: 'ex-44',
            name: 'Preacher Curl (DB)',
            category: 'Kol',
            restTime: 75,
            notes: 'RIR 0 — tam uzat, tepe noktasında sıkıştır. Tek kol tercih.',
            minReps: 6,
            maxReps: 12,
            sets: [
              { id: 's-ppl-20', reps: 12, weight: 12, rir: 0, completed: false },
              { id: 's-ppl-21', reps: 10, weight: 12, rir: 0, completed: false }
            ]
          },
          {
            id: 'we-ppl-10',
            exerciseId: 'ex-15',
            name: 'DB Hammer Curl',
            category: 'Kol',
            restTime: 60,
            notes: 'RIR 0 — brachialis odağı. Geri sallanma.',
            minReps: 6,
            maxReps: 12,
            sets: [
              { id: 's-ppl-22', reps: 12, weight: 12, rir: 0, completed: false },
              { id: 's-ppl-23', reps: 10, weight: 12, rir: 0, completed: false }
            ]
          }
        ]
      },
      {
        id: 'sess-3',
        name: 'PERŞEMBE  —  Leg (Omuz & Bacak & Core)',
        exercises: [
          {
            id: 'we-ppl-11',
            exerciseId: 'ex-11',
            name: 'Cable Lateral Raise (Tek Kol)',
            category: 'Omuz',
            restTime: 60,
            notes: 'RIR 0 — oturarak, momentumsuz. Önce sol kolla başla, zayıf kol kuralı.',
            minReps: 6,
            maxReps: 12,
            sets: [
              { id: 's-ppl-24', reps: 12, weight: 10, rir: 0, completed: false },
              { id: 's-ppl-25', reps: 10, weight: 10, rir: 0, completed: false },
              { id: 's-ppl-26', reps: 10, weight: 10, rir: 0, completed: false }
            ]
          },
          {
            id: 'we-ppl-12',
            exerciseId: 'ex-33',
            name: 'Leg Extension',
            category: 'Bacak',
            restTime: 90,
            notes: 'RIR 1 — son tekrarda 1 tekrar kalırmış gibi bitir. Zayıf bacakla başla.',
            minReps: 6,
            maxReps: 12,
            sets: [
              { id: 's-ppl-27', reps: 12, weight: 35, rir: 1, completed: false },
              { id: 's-ppl-28', reps: 10, weight: 35, rir: 1, completed: false }
            ]
          },
          {
            id: 'we-ppl-13',
            exerciseId: 'ex-34',
            name: 'Seated Leg Curl',
            category: 'Bacak',
            restTime: 90,
            notes: 'RIR 1 — son tekrarda 1 tekrar kalırmış gibi bitir.',
            minReps: 6,
            maxReps: 12,
            sets: [
              { id: 's-ppl-29', reps: 12, weight: 55, rir: 1, completed: false },
              { id: 's-ppl-30', reps: 10, weight: 55, rir: 1, completed: false }
            ]
          },
          {
            id: 'we-ppl-14',
            exerciseId: 'ex-9',
            name: 'Leg Press',
            category: 'Bacak',
            restTime: 90,
            notes: 'RIR 1 — dipte duraksamalı. Topukları yükseğe bas.',
            minReps: 6,
            maxReps: 10,
            sets: [
              { id: 's-ppl-31', reps: 10, weight: 100, rir: 1, completed: false },
              { id: 's-ppl-32', reps: 8, weight: 100, rir: 1, completed: false }
            ]
          },
          {
            id: 'we-ppl-15',
            exerciseId: 'ex-8',
            name: 'Romanian Deadlift (BB/DB)',
            category: 'Bacak',
            restTime: 90,
            notes: 'RIR 1 — Hyperextension alternatifi. Sırt düz, hareket kalçadan.',
            minReps: 6,
            maxReps: 12,
            sets: [
              { id: 's-ppl-33', reps: 12, weight: 50, rir: 1, completed: false },
              { id: 's-ppl-34', reps: 10, weight: 50, rir: 1, completed: false }
            ]
          },
          {
            id: 'we-ppl-16',
            exerciseId: 'ex-52',
            name: 'Cable / Makine Crunch',
            category: 'Karın',
            restTime: 60,
            notes: 'RIR 0 — tam tükenişe git. Hareketi karınla yap, boyunla değil.',
            minReps: 6,
            maxReps: 10,
            sets: [
              { id: 's-ppl-35', reps: 10, weight: 0, rir: 0, completed: false },
              { id: 's-ppl-36', reps: 8, weight: 0, rir: 0, completed: false }
            ]
          }
        ]
      },
      {
        id: 'sess-4',
        name: 'CUMA  —  Push & Pull (Omuz & Göğüs & Sırt & Kol)',
        exercises: [
          {
            id: 'we-ppl-17',
            exerciseId: 'ex-19',
            name: 'Chest Press (Smith Machine)',
            category: 'Göğüs',
            restTime: 120,
            notes: 'RIR 0 — spotter gerektirmez. Sırtını sıkıştır, göğüsle it.',
            minReps: 6,
            maxReps: 10,
            sets: [
              { id: 's-ppl-37', reps: 10, weight: 50, rir: 0, completed: false },
              { id: 's-ppl-38', reps: 8, weight: 50, rir: 0, completed: false }
            ]
          },
          {
            id: 'we-ppl-18',
            exerciseId: 'ex-4',
            name: 'Geniş Tutuş Lat Pulldown',
            category: 'Sırt',
            restTime: 90,
            notes: 'RIR 0 — dik kalarak / frontal düzlemde. Sırtla çek.',
            minReps: 6,
            maxReps: 10,
            sets: [
              { id: 's-ppl-39', reps: 10, weight: 65, rir: 0, completed: false },
              { id: 's-ppl-40', reps: 8, weight: 65, rir: 0, completed: false }
            ]
          },
          {
            id: 'we-ppl-19',
            exerciseId: 'ex-28',
            name: 'Geniş Tutuş Seated Cable Row',
            category: 'Sırt',
            restTime: 90,
            notes: 'RIR 0 — üst sırt odağı. Kürek kemiklerini sıkıştır.',
            minReps: 6,
            maxReps: 10,
            sets: [
              { id: 's-ppl-41', reps: 10, weight: 40, rir: 0, completed: false },
              { id: 's-ppl-42', reps: 8, weight: 40, rir: 0, completed: false }
            ]
          },
          {
            id: 'we-ppl-20',
            exerciseId: 'ex-13',
            name: 'Face Away Cable Curl (Tek Kol)',
            category: 'Kol',
            restTime: 60,
            notes: 'RIR 0 — kablo arkada, dirsek sabit. Tek kol 2, çift kol 3 set.',
            minReps: 6,
            maxReps: 12,
            sets: [
              { id: 's-ppl-43', reps: 12, weight: 15, rir: 0, completed: false },
              { id: 's-ppl-44', reps: 10, weight: 15, rir: 0, completed: false },
              { id: 's-ppl-45', reps: 10, weight: 15, rir: 0, completed: false }
            ]
          },
          {
            id: 'we-ppl-21',
            exerciseId: 'ex-14',
            name: 'Tricep Pushdown (Tek Kol Cable)',
            category: 'Kol',
            restTime: 60,
            notes: 'RIR 0 — tek kol 2, çift kol 3 set. Dirseği vücuda yapıştır.',
            minReps: 6,
            maxReps: 12,
            sets: [
              { id: 's-ppl-46', reps: 12, weight: 10, rir: 0, completed: false },
              { id: 's-ppl-47', reps: 10, weight: 10, rir: 0, completed: false },
              { id: 's-ppl-48', reps: 10, weight: 10, rir: 0, completed: false }
            ]
          },
          {
            id: 'we-ppl-22',
            exerciseId: 'ex-10',
            name: 'Seated DB Shoulder Press',
            category: 'Omuz',
            restTime: 120,
            notes: 'RIR 0 — 90 derecenin altına in. Yukarıda tam kilitlemeden baskıyı omuzda tut.',
            minReps: 6,
            maxReps: 10,
            sets: [
              { id: 's-ppl-49', reps: 10, weight: 20, rir: 0, completed: false },
              { id: 's-ppl-50', reps: 8, weight: 20, rir: 0, completed: false }
            ]
          }
        ]
      },
      {
        id: 'sess-5',
        name: 'CUMARTESİ  —  Legs (Quad & Hamstring & Glute)',
        exercises: [
          {
            id: 'we-ppl-23',
            exerciseId: 'ex-33',
            name: 'Leg Extension',
            category: 'Bacak',
            restTime: 90,
            notes: 'RIR 0 — tam tükenişe git. Zayıf bacakla başla.',
            minReps: 6,
            maxReps: 12,
            sets: [
              { id: 's-ppl-51', reps: 12, weight: 35, rir: 0, completed: false },
              { id: 's-ppl-52', reps: 10, weight: 35, rir: 0, completed: false }
            ]
          },
          {
            id: 'we-ppl-24',
            exerciseId: 'ex-34',
            name: 'Lying Leg Curl',
            category: 'Bacak',
            restTime: 90,
            notes: 'RIR 0 — tam tükenişe git.',
            minReps: 6,
            maxReps: 12,
            sets: [
              { id: 's-ppl-53', reps: 12, weight: 55, rir: 0, completed: false },
              { id: 's-ppl-54', reps: 10, weight: 55, rir: 0, completed: false }
            ]
          },
          {
            id: 'we-ppl-25',
            exerciseId: 'ex-7',
            name: 'Smith Machine Squat',
            category: 'Bacak',
            restTime: 120,
            notes: 'RIR 2 — dipte duraksamalı. Alternatif: hack squat, barbell squat, DB goblet squat.',
            minReps: 6,
            maxReps: 10,
            sets: [
              { id: 's-ppl-55', reps: 10, weight: 60, rir: 2, completed: false },
              { id: 's-ppl-56', reps: 8, weight: 60, rir: 2, completed: false }
            ]
          },
          {
            id: 'we-ppl-26',
            exerciseId: 'ex-38',
            name: 'Smith Machine Calf Raise',
            category: 'Bacak',
            restTime: 45,
            notes: 'RIR 0 — dipte 4 sn duraksa. Parmak ucunda tam yüksel.',
            minReps: 6,
            maxReps: 12,
            sets: [
              { id: 's-ppl-57', reps: 12, weight: 80, rir: 0, completed: false },
              { id: 's-ppl-58', reps: 10, weight: 80, rir: 0, completed: false }
            ]
          },
          {
            id: 'we-ppl-27',
            exerciseId: 'ex-8',
            name: 'Romanian Deadlift (Barbell)',
            category: 'Bacak',
            restTime: 120,
            notes: 'RIR 2 — sırt düz, hareket kalçadan.',
            minReps: 6,
            maxReps: 10,
            sets: [
              { id: 's-ppl-59', reps: 10, weight: 50, rir: 2, completed: false },
              { id: 's-ppl-60', reps: 8, weight: 50, rir: 2, completed: false }
            ]
          },
          {
            id: 'we-ppl-28',
            exerciseId: 'ex-52',
            name: 'Cable / Makine Crunch',
            category: 'Karın',
            restTime: 60,
            notes: 'RIR 0 — tam tükenişe git. Hareketi karınla yap, boyunla değil.',
            minReps: 6,
            maxReps: 10,
            sets: [
              { id: 's-ppl-61', reps: 10, weight: 0, rir: 0, completed: false },
              { id: 's-ppl-62', reps: 8, weight: 0, rir: 0, completed: false }
            ]
          }
        ]
      }
    ]
  }
];

export const getExercises = (): Exercise[] => {
  const data = localStorage.getItem('aurafit_exercises');
  if (!data) {
    localStorage.setItem('aurafit_exercises', JSON.stringify(INITIAL_EXERCISES));
    return INITIAL_EXERCISES;
  }
  
  const existing: Exercise[] = JSON.parse(data);
  const existingIds = new Set(existing.map(ex => ex.id));
  
  // Find any missing default exercises
  const missing = INITIAL_EXERCISES.filter(ex => !existingIds.has(ex.id));
  
  if (missing.length > 0) {
    const updated = [...existing, ...missing];
    localStorage.setItem('aurafit_exercises', JSON.stringify(updated));
    return updated;
  }
  
  return existing;
};

export const saveExercises = (exercises: Exercise[]): void => {
  localStorage.setItem('aurafit_exercises', JSON.stringify(exercises));
};

export const getPrograms = (): WorkoutProgram[] => {
  const data = localStorage.getItem('aurafit_programs');
  if (!data) {
    localStorage.setItem('aurafit_programs', JSON.stringify(INITIAL_PROGRAMS));
    return INITIAL_PROGRAMS;
  }
  
  let existing: WorkoutProgram[] = JSON.parse(data);
  const oldIds = ['prog-1', 'prog-2', 'prog-3', 'prog-4'];
  const hasOldDefaults = existing.some(p => oldIds.includes(p.id));
  
  if (hasOldDefaults) {
    existing = existing.filter(p => !oldIds.includes(p.id));
  }

  const existingIds = new Set(existing.map(p => p.id));
  const missing = INITIAL_PROGRAMS.filter(p => !existingIds.has(p.id));
  
  if (missing.length > 0 || hasOldDefaults) {
    const updated = [...existing, ...missing];
    localStorage.setItem('aurafit_programs', JSON.stringify(updated));
    return updated;
  }
  
  return existing;
};

export const savePrograms = (programs: WorkoutProgram[]): void => {
  localStorage.setItem('aurafit_programs', JSON.stringify(programs));
};

export const getHistory = (): CompletedWorkout[] => {
  const data = localStorage.getItem('aurafit_history');
  if (!data) {
    const defaultHistory: CompletedWorkout[] = [
      {
        id: 'h-1',
        programId: 'prog-1',
        programName: 'Push (İtiş) Günü',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
        duration: 45,
        totalVolume: 2150,
        exercises: []
      },
      {
        id: 'h-2',
        programId: 'prog-2',
        programName: 'Pull (Çekiş) Günü',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // yesterday
        duration: 50,
        totalVolume: 1840,
        exercises: []
      }
    ];
    localStorage.setItem('aurafit_history', JSON.stringify(defaultHistory));
    return defaultHistory;
  }
  return JSON.parse(data);
};

export const saveHistory = (history: CompletedWorkout[]): void => {
  localStorage.setItem('aurafit_history', JSON.stringify(history));
};

export const getWeightLogs = (): WeightLog[] => {
  const data = localStorage.getItem('aurafit_weight_logs');
  return data ? JSON.parse(data) : [];
};

export const saveWeightLogs = (logs: WeightLog[]): void => {
  localStorage.setItem('aurafit_weight_logs', JSON.stringify(logs));
};

export const getPersonalRecords = (): PersonalRecord[] => {
  const data = localStorage.getItem('aurafit_personal_records');
  return data ? JSON.parse(data) : [];
};

export const savePersonalRecords = (prs: PersonalRecord[]): void => {
  localStorage.setItem('aurafit_personal_records', JSON.stringify(prs));
};

export const getPublicPrograms = (): any[] => {
  const data = localStorage.getItem('aurafit_public_programs');
  return data ? JSON.parse(data) : [];
};

export const savePublicPrograms = (programs: any[]): void => {
  localStorage.setItem('aurafit_public_programs', JSON.stringify(programs));
};
