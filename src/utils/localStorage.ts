import type { Exercise, WorkoutProgram, CompletedWorkout, WeightLog, PersonalRecord } from '../types';
import { DATASET_EXERCISES } from './datasetExercises';

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
  { id: 'ex-132', name: 'EZ-Bar Skullcrusher', category: 'Kol', description: 'Z-bar kullanarak sehpada yatarak yapılan arka kol alna press egzersizi.' },

  // Göğüs (Chest) - Genişletilmiş
  { id: 'ex-133', name: 'Incline Cable Fly', category: 'Göğüs', description: 'Eğik pozisyonda kablo çaprazlaması. Üst göğüs liflerini esnetme odaklı çalıştırır.' },
  { id: 'ex-134', name: 'Low Cable Fly', category: 'Göğüs', description: 'Aşağıdan yukarıya kablo çaprazlaması. Alt göğüs liflerini hedefler.' },
  { id: 'ex-135', name: 'Svend Press', category: 'Göğüs', description: 'İki plaka arasında avuç içleriyle sıkıştırarak yapılan izometrik göğüs presi.' },
  { id: 'ex-136', name: 'Smith Machine Incline Press', category: 'Göğüs', description: 'Smith makinesiyle eğik sehpada yapılan güvenli üst göğüs presi.' },
  { id: 'ex-137', name: 'Dumbbell Pullover', category: 'Göğüs', description: 'Sehpada yatarak dambılı baş arkasından göğüs üstüne getiren kanat ve göğüs egzersizi.' },
  { id: 'ex-138', name: 'Wide Push-Up', category: 'Göğüs', description: 'Geniş el duruşuyla yapılan şınav. Göğüs dış liflerini hedefler.' },
  { id: 'ex-139', name: 'Archer Push-Up', category: 'Göğüs', description: 'Yana doğru yük aktararak yapılan tek kol ağırlıklı şınav varyasyonu.' },
  { id: 'ex-140', name: 'Plyometric Push-Up', category: 'Göğüs', description: 'Yere inen gövdeyi patlayıcı bir kuvvetle iterek elleri yerden kaldıran güç şınavı.' },

  // Sırt (Back) - Genişletilmiş
  { id: 'ex-141', name: 'Pendlay Row', category: 'Sırt', description: 'Barı her tekrarda zeminden kaldıran patlayıcı sırt küreği. Üst sırt gücü için idealdir.' },
  { id: 'ex-142', name: 'Meadows Row', category: 'Sırt', description: 'Barın ucunu tek elle çeken unilateral sırt hareketi. Üst ve orta sırtı hedefler.' },
  { id: 'ex-143', name: 'Seal Row', category: 'Sırt', description: 'Yüksek sehpada yüzüstü yatarak yapılan dambıl sırt küreği. Momentum tamamen ortadan kalkar.' },
  { id: 'ex-144', name: 'Wide Grip Pull-Up', category: 'Sırt', description: 'Geniş tutuşla yapılan barfiks. Kanat kaslarının (lat) genişliğini maksimum çalıştırır.' },
  { id: 'ex-145', name: 'Neutral Grip Pull-Up', category: 'Sırt', description: 'Avuç içleri karşı karşıya (nötral) tutuşla yapılan barfiks. Biceps ve kanat kaslarını dengeli çalıştırır.' },
  { id: 'ex-146', name: 'Barbell Good Morning', category: 'Sırt', description: 'Barbeli sırtta tutarak öne eğilen egzersiz. Bel kasları ve hamstringleri kuvvetlendirir.' },
  { id: 'ex-147', name: 'Cable Straight Arm Pulldown', category: 'Sırt', description: 'Kollar düz tutularak kablonun aşağı çekildiği kanat izole egzersizi.' },
  { id: 'ex-148', name: 'Trap Bar Deadlift', category: 'Sırt', description: 'Altıgen barlı deadlift. Bel üzerindeki stresi azaltır, kuadriseps ve kalça kaslarını daha dengeli çalıştırır.' },
  { id: 'ex-149', name: 'Barbell Shrug', category: 'Sırt', description: 'Barbell ile omuz silkme. Üst trapez kaslarını hedefleyen temel egzersiz.' },
  { id: 'ex-150', name: 'Dumbbell Pullover (Back Focus)', category: 'Sırt', description: 'Sehpada yatarak dambılı baş arkasından çekerek kanat kaslarını esnetme odaklı sırt hareketi.' },

  // Bacak (Legs) - Genişletilmiş
  { id: 'ex-151', name: 'Sissy Squat', category: 'Bacak', description: 'Topuklar yükseltilmiş şekilde geriye yatarak yapılan yoğun kuadriseps izole egzersizi.' },
  { id: 'ex-152', name: 'Reverse Lunge', category: 'Bacak', description: 'Geriye adım atarak yapılan lunge. Diz üzerindeki stresi azaltır, glute ve hamstringleri vurgular.' },
  { id: 'ex-153', name: 'Lateral Lunge', category: 'Bacak', description: 'Yana adım atarak yapılan lunge. İç bacak, kalça ve kuadriseps kaslarını çalıştırır.' },
  { id: 'ex-154', name: 'Curtsy Lunge', category: 'Bacak', description: 'Ayağı arkaya çapraz atarak yapılan lunge. Glute medius ve kuadriseps kaslarını hedefler.' },
  { id: 'ex-155', name: 'Landmine Squat', category: 'Bacak', description: 'Bar ucuyla yapılan squat varyasyonu. Bel üzerindeki yükü azaltırken kuadrisepsleri hedefler.' },
  { id: 'ex-156', name: 'Pause Squat', category: 'Bacak', description: 'Dipte birkaç saniye beklenerek yapılan squat. Esneme-kısalma döngüsünü ortadan kaldırır, güç ve kasılma kapasitesini artırır.' },
  { id: 'ex-157', name: 'Single Leg Romanian Deadlift', category: 'Bacak', description: 'Tek bacak üzerinde yapılan Romanian deadlift. Denge ve unilateral hamstring gücü gerektirir.' },
  { id: 'ex-158', name: 'Nordic Hamstring Curl', category: 'Bacak', description: 'Ayaklar sabitlenerek öne eğilip tutulan yoğun hamstring eksantrik egzersizi. Hamstring yaralanmalarına karşı koruyucudur.' },
  { id: 'ex-159', name: 'Seated Leg Curl', category: 'Bacak', description: 'Oturarak makinede yapılan hamstring büküş egzersizi.' },
  { id: 'ex-160', name: 'Jefferson Squat', category: 'Bacak', description: 'Barbeli bacakların arasından kaldıran asimetrik squat. Kalça ve bacak kaslarını farklı bir açıdan çalıştırır.' },
  { id: 'ex-161', name: 'Safety Bar Squat', category: 'Bacak', description: 'Güvenlik barbeli ile yapılan squat. Bel ve omuz esnekliği gereksinimini azaltır.' },
  { id: 'ex-162', name: 'Leg Press (Single Leg)', category: 'Bacak', description: 'Tek bacakla yapılan leg press. Güç asimetrilerini giderir.' },
  { id: 'ex-163', name: 'Cable Pull-Through', category: 'Bacak', description: 'Kablo yardımıyla kalça itişi hareketi. Glute ve hamstring kaslarını aktive eder.' },
  { id: 'ex-164', name: 'Kettlebell Goblet Squat', category: 'Bacak', description: 'Kettlebell ile goblet squat. Derin çömelme pozisyonunu kolaylaştırır.' },

  // Omuz (Shoulders) - Genişletilmiş
  { id: 'ex-165', name: 'Single Arm Cable Lateral Raise', category: 'Omuz', description: 'Kablo makinesinde tek kol yana açış. Sabit direnç ile yan omuz liflerini izole eder.' },
  { id: 'ex-166', name: 'Landmine Press (Shoulder)', category: 'Omuz', description: 'Bar ucuyla yapılan başüstü omuz presi. Ön omuz ve üst göğsü çalıştırır.' },
  { id: 'ex-167', name: 'Plate Lateral Raise', category: 'Omuz', description: 'Ağırlık plakasıyla yapılan yana açış. Yan omuz başlarını izole eder.' },
  { id: 'ex-168', name: 'Band Pull-Apart', category: 'Omuz', description: 'Direnç bandını iki elinizle tutarak yanlara doğru gererek yapılan arka omuz ve üst sırt egzersizi.' },
  { id: 'ex-169', name: 'Cable Rear Delt Fly', category: 'Omuz', description: 'Kablo çaprazlamasında arka omuz kaslarını çalıştıran açış hareketi.' },
  { id: 'ex-170', name: 'Leaning Lateral Raise', category: 'Omuz', description: 'Yana doğru eğilerek yapılan kablo yana açış. Yan omuz kasını tam hareket açıklığında çalıştırır.' },
  { id: 'ex-171', name: 'Dumbbell Y-T-W Raise', category: 'Omuz', description: 'Eğik sehpada Y, T ve W şekilleri oluşturarak yapılan alt trapez ve arka omuz egzersizi.' },
  { id: 'ex-172', name: 'Seated Machine Shoulder Press', category: 'Omuz', description: 'Oturarak makinede yapılan başüstü omuz presi. Stabilizasyon gerektirmez.' },
  { id: 'ex-173', name: 'Push Press', category: 'Omuz', description: 'Diz bükümü yardımıyla momentum kazanılan barbell başüstü pres. Güç ve patlayıcılık geliştirir.' },

  // Kol (Arms) - Genişletilmiş
  { id: 'ex-174', name: 'Zottman Curl', category: 'Kol', description: 'Yukarıda normal tutuşta, aşağıda ters tutuşta yapılan dambıl curl. Hem biceps hem de ön kol kaslarını çalıştırır.' },
  { id: 'ex-175', name: 'Cross Body Hammer Curl', category: 'Kol', description: 'Dambılı vücudun karşı tarafına doğru çeken hammer curl varyasyonu. Brachialis kasını yoğun çalıştırır.' },
  { id: 'ex-176', name: 'Cable Curl (Straight Bar)', category: 'Kol', description: 'Kablo makinesinde düz barla yapılan bicep curl. Sabit gerilim sağlar.' },
  { id: 'ex-177', name: 'Single Arm Cable Curl', category: 'Kol', description: 'Kablo makinesinde tek kolla yapılan izole bicep curl.' },
  { id: 'ex-178', name: 'Pin Wheel Curl', category: 'Kol', description: 'Dambılı çarkıfelek gibi vücudun yanından geçirerek yapılan ön kol büküşü.' },
  { id: 'ex-179', name: 'Triceps Parallel Bar Dips', category: 'Kol', description: 'Paralel barlarda dik duruşla yapılan triceps odaklı dips hareketi.' },
  { id: 'ex-180', name: 'Diamond Push-Up', category: 'Kol', description: 'Ellerle elmas şekli oluşturularak yapılan şınav. Triceps kaslarını yoğun çalıştırır.' },
  { id: 'ex-181', name: 'JM Press', category: 'Kol', description: 'Skullcrusher ve close grip bench pressin hibridi olan triceps güç egzersizi.' },
  { id: 'ex-182', name: 'Tate Press', category: 'Kol', description: 'Dambılların dirsek üzerinde kıvrıldığı triceps izole egzersizi.' },
  { id: 'ex-183', name: 'Lying Dumbbell Tricep Extension', category: 'Kol', description: 'Sehpada yatarak dambılları baş arkasına indirip kaldıran triceps uzatma hareketi.' },
  { id: 'ex-184', name: 'One Arm Overhead Tricep Extension', category: 'Kol', description: 'Tek dambıl ile tek kol başüstü triceps extension. Uzun başı tam esneme ile çalıştırır.' },
  { id: 'ex-185', name: 'Reverse Curl', category: 'Kol', description: 'Ters tutuşla (avuçlar aşağı) yapılan barbell veya dambıl curl. Brachioradialis ve ön kol kaslarını hedefler.' },
  { id: 'ex-186', name: 'Wrist Roller', category: 'Kol', description: 'Bileği döndürerek ağırlık asılı ipi makara üstüne saran ön kol dayanıklılık egzersizi.' },
  { id: 'ex-187', name: 'Seated Alternating Dumbbell Curl', category: 'Kol', description: 'Oturarak sırayla sağ ve sol kolla yapılan dambıl bicep curl.' },

  // Karın (Core) - Genişletilmiş
  { id: 'ex-188', name: 'L-Sit Hold', category: 'Karın', description: 'Paralel barlarda veya zeminde kolları düz tutarak gövdeyi ve bacakları yatay pozisyonda sabit tutma. İleri düzey core gücü gerektirir.' },
  { id: 'ex-189', name: 'Dragon Flag', category: 'Karın', description: 'Sehpa kenarını tutarak tüm vücudu düz bir çubuk gibi yukarı kaldıran Bruce Lee\'ye atfedilen ileri düzey core hareketi.' },
  { id: 'ex-190', name: 'Hollow Body Hold', category: 'Karın', description: 'Sırtüstü yatarak bel zemine değmeyecek şekilde kol ve bacakları uzatarak tutulan izometrik core egzersizi.' },
  { id: 'ex-191', name: 'V-Up', category: 'Karın', description: 'Sırtüstü yatarak aynı anda kol ve bacakları yukarı kaldırıp birbirine yaklaştıran tam karın egzersizi.' },
  { id: 'ex-192', name: 'Reverse Crunch', category: 'Karın', description: 'Sırtüstü yatarak dizleri göğse doğru çekip kalçayı yerden kaldıran alt karın egzersizi.' },
  { id: 'ex-193', name: 'Oblique Crunch', category: 'Karın', description: 'Yan yatış pozisyonunda yapılan mekik. Yan karın (oblik) kaslarını izole eder.' },
  { id: 'ex-194', name: 'Pallof Press', category: 'Karın', description: 'Kablo makinesinde rotasyona direnç göstererek yapılan anti-rotasyon core stabilizasyon egzersizi.' },
  { id: 'ex-195', name: 'Suitcase Carry', category: 'Karın', description: 'Tek elde ağırlık taşıyarak yürüme. Lateral core stabilitesini ve fonksiyonel gücü geliştirir.' },
  { id: 'ex-196', name: 'Farmer\'s Walk', category: 'Karın', description: 'Her iki elde ağır ağırlıklarla yürüme. Genel kavrama gücü, core stabilizasyon ve kondisyon sağlar.' },
  { id: 'ex-197', name: 'Copenhagen Plank', category: 'Karın', description: 'Sehpa üzerinde ayağı yan olarak destekleyerek yapılan ileri düzey yan plank. Kalça addüktörlerini ve oblik kasları güçlendirir.' },
  { id: 'ex-198', name: 'Stir The Pot', category: 'Karın', description: 'Dirsekleri egzersiz topunun üzerinde dairesel hareketle döndürerek yapılan dinamik plank. Core stabilitesini güçlendirir.' },
  { id: 'ex-199', name: 'Swiss Ball Crunch', category: 'Karın', description: 'Egzersiz topu üzerinde sırtüstü uzanarak yapılan mekik. Tam hareket açıklığı sağlar.' },
  { id: 'ex-200', name: 'Windshield Wiper', category: 'Karın', description: 'Sırtüstü yatarak bacakları bir silecek gibi yanlara indirip kaldıran oblik ve kalça fleksör egzersizi.' },

  // Kardiyo (Cardio) - Genişletilmiş
  { id: 'ex-201', name: 'Box Jump', category: 'Kardiyo', description: 'Kutuya sıçrama egzersizi. Patlayıcı bacak gücü ve atletizm geliştirir.' },
  { id: 'ex-202', name: 'Sprint Intervals', category: 'Kardiyo', description: 'Kısa mesafelerde maksimum hızda koşu aralıkları. HIIT kondisyon ve yağ yakımı için etkilidir.' },
  { id: 'ex-203', name: 'Jump Squat', category: 'Kardiyo', description: 'Squat pozisyonundan patlayıcı sıçrama. Bacak gücü ve kardiyo kapasitesini eş zamanlı geliştirir.' },
  { id: 'ex-204', name: 'High Knees', category: 'Kardiyo', description: 'Yerinde koşarken dizleri bel hizasına kadar yüksek kaldırma egzersizi. Kardiyo ve core aktivasyonu sağlar.' },
  { id: 'ex-205', name: 'Jumping Jacks', category: 'Kardiyo', description: 'Ayakları açıp kapayarak kolları eş zamanlı aşağı ve yukarı hareket ettiren ısınma ve kardiyo egzersizi.' },
  { id: 'ex-206', name: 'Sled Pull', category: 'Kardiyo', description: 'Ağırlıklı kızağı ip veya askıyla kendine doğru çekme. Sırt, kollar ve bacakları güçlendirirken kardiyo kondisyonu sağlar.' },
  { id: 'ex-207', name: 'Tire Flip', category: 'Kardiyo', description: 'Büyük lastiği yerden kaldırıp ileriye doğru devirme. Tüm vücut patlayıcı gücünü ve kardiyoyu çalıştırır.' },
  { id: 'ex-208', name: 'Swimming', category: 'Kardiyo', description: 'Havuzda veya açık suda yüzme. Düşük eklem yüklü, tüm vücudu çalıştıran dayanıklılık egzersizi.' },
  { id: 'ex-209', name: 'Cycling (Outdoor)', category: 'Kardiyo', description: 'Açık havada bisiklet sürme. Bacak dayanıklılığı ve kardiyovasküler sağlık için etkilidir.' },
  { id: 'ex-210', name: 'Walking', category: 'Kardiyo', description: 'Orta tempo yürüyüş. Günlük NEAT aktivitesini artırır ve düşük yoğunluklu kardiyo sağlar.' },
  { id: 'ex-211', name: 'HIIT Circuit', category: 'Kardiyo', description: 'Yüksek yoğunluklu aralık antrenman devresi. Birden fazla egzersizi arka arkaya dinlenmesiz yaparak kalori yakımını maksimize eder.' },
  { id: 'ex-212', name: 'Ski Erg', category: 'Kardiyo', description: 'Kayak simülatörü makinesinde çift kollu aşağı çekiş hareketi. Üst vücut ve kardiyo kapasitesini geliştirir.' },
  { id: 'ex-213', name: 'Versa Climber', category: 'Kardiyo', description: 'Tırmanma simülatöründe karşılıklı kol ve bacak hareketi. Yüksek yoğunluklu tüm vücut kardiyo egzersizi.' },
  { id: 'ex-214', name: 'Depth Jump', category: 'Kardiyo', description: 'Kutudan inerek anında sıçrama. Reaktif kuvvet ve patlayıcı bacak gücü geliştirir.' },
  { id: 'ex-215', name: 'Lateral Bound', category: 'Kardiyo', description: 'Yana doğru tek bacakla sıçrayıp karşı tarafta iniş yapılan pliometrik egzersiz. Lateral güç ve denge geliştirir.' },

  // Bacak İzolasyon & Kalça (Leg Isolation & Glute)
  { id: 'ex-216', name: 'Hip Abduction Machine (Bacak Yana Açış)', category: 'Bacak', description: 'Makinede oturarak bacakları yana açma hareketi. Kalça ortası (glute medius) ve dış bacak kaslarını izole eder.' },
  { id: 'ex-217', name: 'Hip Adduction Machine (Bacak İçe Kapama)', category: 'Bacak', description: 'Makinede oturarak bacakları içe kapatma hareketi. İç bacak kaslarını (adductors) izole eder.' },
  { id: 'ex-218', name: 'Cable Hip Abduction (Kablo Yana Açış)', category: 'Bacak', description: 'Kablo makinesine ayak bileği aparatı takarak bacağı yana doğru kaldırma. Dış kalça kaslarını çalıştırır.' },
  { id: 'ex-219', name: 'Cable Hip Adduction (Kablo İçe Kapama)', category: 'Bacak', description: 'Kablo makinesine ayak bileği aparatı takarak bacağı içe doğru çekme. İç bacak kaslarını hedefler.' },
  { id: 'ex-220', name: 'Lateral Band Walk (Yan Bant Yürüyüşü)', category: 'Bacak', description: 'Dizlere veya ayak bileklerine direnç bandı takarak yana doğru yürüme. Glute medius aktivasyonu için idealdir.' },
  { id: 'ex-221', name: 'Clamshell (Deniz Kabuğu)', category: 'Bacak', description: 'Yan yatışta dizleri büküp ayakları kapalı tutarak üst dizi yukarı kaldırma. Glute medius ve dış rotator kasları çalıştırır.' },
  { id: 'ex-222', name: 'Glute Bridge', category: 'Bacak', description: 'Sırtüstü yatarak kalçayı yukarı kaldırma hareketi. Glute kaslarını ve hamstringleri aktive eder.' },
  { id: 'ex-223', name: 'Single Leg Glute Bridge', category: 'Bacak', description: 'Tek bacak ile yapılan kalça köprüsü. Unilateral glute gücünü ve kalça stabilitesini geliştirir.' },
  { id: 'ex-224', name: 'Fire Hydrant', category: 'Bacak', description: 'Dört ayaklı pozisyonda bacağı yana kaldırma hareketi. Glute medius ve kalça dış rotatorlarını aktive eder.' },
  { id: 'ex-225', name: 'Donkey Kick (Eşek Tekme)', category: 'Bacak', description: 'Dört ayaklı pozisyonda bacağı geriye ve yukarı itme. Glute maksimus kasını izole eder.' },
  { id: 'ex-226', name: 'Cable Kickback (Kablo Glute Kickback)', category: 'Bacak', description: 'Kablo makinesine ayak bileği aparatı takarak bacağı geriye doğru itme. Glute kasını yoğun izole eder.' },
  { id: 'ex-227', name: 'Frog Pump', category: 'Bacak', description: 'Sırtüstü yatarak ayak tabanlarını birbirine değdirip kalçayı yukarı pompalama. Glute medius ve maksimus için etkilidir.' },
  { id: 'ex-228', name: 'Sumo Squat', category: 'Bacak', description: 'Geniş duruşla ve ayak parmakları dışa bakacak şekilde yapılan squat. İç bacak ve kalça kaslarını daha fazla çalıştırır.' },
  { id: 'ex-229', name: 'Curtsy Lunge with Lateral Raise', category: 'Bacak', description: 'Çapraz lunge yaparken yana dambıl açışı yapılan bileşik hareket. Glute medius ve lateral head omuz kaslarını aynı anda çalıştırır.' },
  { id: 'ex-230', name: 'Seated Hip Abduction (Band)', category: 'Bacak', description: 'Oturarak dizlerin üstüne yerleştirilen direnç bandıyla bacakları yana açma. Glute medius için etkili bir ısınma ve izolasyon hareketi.' },
  { id: 'ex-231', name: 'Standing Hip Abduction (Band)', category: 'Bacak', description: 'Ayakta direnç bandıyla bacağı yana kaldırma. Denge ve kalça dış kaslarını çalıştırır.' },
  { id: 'ex-232', name: 'Monster Walk', category: 'Bacak', description: 'Ayak bileklerine bant takarak öne ve yana çapraz adımlar atma. Kalça dış kaslarını ve glute mediusu aktive eder.' },
  { id: 'ex-233', name: 'Abductor Stretch (Kalça Dış Kasları Germe)', category: 'Bacak', description: 'Kalça dış kaslarını ve IT bandını esneten statik germe egzersizi.' },
  { id: 'ex-234', name: 'Adductor Stretch (İç Bacak Germe)', category: 'Bacak', description: 'Bacak açık oturarak ya da duvarla iç bacak kaslarını esneten statik germe egzersizi.' },

  // Ek Bacak Hareketleri
  { id: 'ex-235', name: 'Leg Extension (Single Leg)', category: 'Bacak', description: 'Tek bacakla yapılan leg extension. Kuadriseps kaslarındaki güç asimetrilerini giderir.' },
  { id: 'ex-236', name: 'Standing Leg Curl', category: 'Bacak', description: 'Ayakta makinede tek bacakla yapılan hamstring büküş egzersizi.' },
  { id: 'ex-237', name: 'Hack Squat (45°)', category: 'Bacak', description: '45 derece hack squat makinesinde yapılan çömelme hareketi. Kuadriseps ve kalçayı dengeli çalıştırır.' },
  { id: 'ex-238', name: 'Smith Machine Hip Thrust', category: 'Bacak', description: 'Smith makinesi barıyla yapılan kalça itişi. Ağırlık kontrolü ve güvenlik açısından avantajlıdır.' },
  { id: 'ex-239', name: 'Dumbbell Hip Thrust', category: 'Bacak', description: 'Dambıl ile yapılan kalça itişi. Makine yokken alternatif olarak kullanılır.' },
  { id: 'ex-240', name: 'B-Stance Hip Thrust', category: 'Bacak', description: 'Bir ayak önde, bir ayak hafif geride tutularak yapılan kalça itişi. Unilateral glute aktivasyonu sağlar.' },
  ...DATASET_EXERCISES
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

  let existing: Exercise[];
  try {
    existing = JSON.parse(data);
  } catch {
    localStorage.removeItem('aurafit_exercises');
    return INITIAL_EXERCISES;
  }

  const existingIds = new Set(existing.map(ex => ex.id));
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

  let existing: WorkoutProgram[];
  try {
    existing = JSON.parse(data);
  } catch {
    localStorage.removeItem('aurafit_programs');
    return INITIAL_PROGRAMS;
  }
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
  try {
    return JSON.parse(data);
  } catch {
    localStorage.removeItem('aurafit_history');
    return [];
  }
};

export const saveHistory = (history: CompletedWorkout[]): void => {
  localStorage.setItem('aurafit_history', JSON.stringify(history));
};

export const getWeightLogs = (): WeightLog[] => {
  const data = localStorage.getItem('aurafit_weight_logs');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    localStorage.removeItem('aurafit_weight_logs');
    return [];
  }
};

export const saveWeightLogs = (logs: WeightLog[]): void => {
  localStorage.setItem('aurafit_weight_logs', JSON.stringify(logs));
};

export const getPersonalRecords = (): PersonalRecord[] => {
  const data = localStorage.getItem('aurafit_personal_records');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    localStorage.removeItem('aurafit_personal_records');
    return [];
  }
};

export const savePersonalRecords = (prs: PersonalRecord[]): void => {
  localStorage.setItem('aurafit_personal_records', JSON.stringify(prs));
};

export const getPublicPrograms = (): any[] => {
  const data = localStorage.getItem('aurafit_public_programs');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    localStorage.removeItem('aurafit_public_programs');
    return [];
  }
};

export const savePublicPrograms = (programs: any[]): void => {
  localStorage.setItem('aurafit_public_programs', JSON.stringify(programs));
};
