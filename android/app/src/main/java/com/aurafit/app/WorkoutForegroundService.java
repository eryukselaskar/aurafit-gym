package com.aurafit.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.AudioFormat;
import android.media.AudioManager;
import android.media.AudioTrack;
import android.os.Build;
import android.os.IBinder;
import android.os.VibrationEffect;
import android.os.Vibrator;
import androidx.core.app.NotificationCompat;

public class WorkoutForegroundService extends Service {
    public static final String ACTION_START = "com.aurafit.app.ACTION_START";
    public static final String ACTION_PAUSE = "com.aurafit.app.ACTION_PAUSE";
    public static final String ACTION_RESUME = "com.aurafit.app.ACTION_RESUME";
    public static final String ACTION_UPDATE = "com.aurafit.app.ACTION_UPDATE";
    public static final String ACTION_STOP = "com.aurafit.app.ACTION_STOP";
    public static final String ACTION_SKIP_REST = "com.aurafit.app.ACTION_SKIP_REST";

    private static final String CHANNEL_ID = "workout_channel_id";
    private static final int NOTIFICATION_ID = 1001;

    private String currentWorkoutName = "AuraFit - Antrenman";
    private boolean isRunning = false;
    private long baseTime = 0;
    private long elapsedSeconds = 0;

    // Rest tracking fields
    private boolean isResting = false;
    private long restEndTime = 0;
    private android.os.Handler restHandler = new android.os.Handler(android.os.Looper.getMainLooper());
    private Runnable restRunnable = new Runnable() {
        @Override
        public void run() {
            if (isResting) {
                isResting = false;
                playSynthesizedChime();
                triggerVibration();

                long currentElapsed = elapsedSeconds;
                if (isRunning) {
                    currentElapsed = (System.currentTimeMillis() - baseTime) / 1000;
                }

                Notification notification = buildNotification(currentWorkoutName, isRunning, currentElapsed);
                NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                if (manager != null) {
                    manager.notify(NOTIFICATION_ID, notification);
                }

                if (listener != null) {
                    listener.onAction(ACTION_SKIP_REST);
                }
            }
        }
    };

    public interface ServiceListener {
        void onAction(String action);
    }

    private static ServiceListener listener;

    public static void setListener(ServiceListener l) {
        listener = l;
    }

    @Override
    public void onCreate() {
        super.onCreate();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_START.equals(action)) {
                String workoutName = intent.getStringExtra("workoutName");
                long elapsed = intent.getLongExtra("elapsedSeconds", 0);
                
                this.currentWorkoutName = workoutName != null ? workoutName : "AuraFit - Antrenman";
                this.elapsedSeconds = elapsed;
                this.isRunning = true;
                this.baseTime = System.currentTimeMillis() - (this.elapsedSeconds * 1000);
                
                this.isResting = false;
                restHandler.removeCallbacks(restRunnable);

                startWorkoutForeground(this.currentWorkoutName, this.elapsedSeconds);
            } else if (ACTION_PAUSE.equals(action)) {
                pauseWorkoutForeground();
                if (listener != null) {
                    listener.onAction(ACTION_PAUSE);
                }
            } else if (ACTION_RESUME.equals(action)) {
                long elapsed = intent.getLongExtra("elapsedSeconds", this.elapsedSeconds);
                resumeWorkoutForeground(elapsed);
                if (listener != null) {
                    listener.onAction(ACTION_RESUME);
                }
            } else if (ACTION_UPDATE.equals(action)) {
                String workoutName = intent.getStringExtra("workoutName");
                if (workoutName != null) {
                    this.currentWorkoutName = workoutName;
                }
                
                boolean newIsResting = intent.getBooleanExtra("isResting", false);
                int newRestSecondsLeft = intent.getIntExtra("restSecondsLeft", 0);
                
                if (newIsResting) {
                    restHandler.removeCallbacks(restRunnable);
                    this.isResting = true;
                    this.restEndTime = System.currentTimeMillis() + (newRestSecondsLeft * 1000);
                    restHandler.postDelayed(restRunnable, newRestSecondsLeft * 1000);
                } else {
                    if (this.isResting) {
                        restHandler.removeCallbacks(restRunnable);
                        this.isResting = false;
                    }
                }
                
                long currentElapsed = this.elapsedSeconds;
                if (this.isRunning) {
                    currentElapsed = (System.currentTimeMillis() - this.baseTime) / 1000;
                }
                
                Notification notification = buildNotification(this.currentWorkoutName, this.isRunning, currentElapsed);
                NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                if (manager != null) {
                    manager.notify(NOTIFICATION_ID, notification);
                }
            } else if (ACTION_STOP.equals(action)) {
                restHandler.removeCallbacks(restRunnable);
                if (listener != null) {
                    listener.onAction(ACTION_STOP);
                }
                stopSelf();
            } else if (ACTION_SKIP_REST.equals(action)) {
                skipRestForeground();
            }
        }
        return START_NOT_STICKY;
    }

    private void startWorkoutForeground(String workoutName, long elapsedSeconds) {
        createNotificationChannel();
        Notification notification = buildNotification(workoutName, true, elapsedSeconds);
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
    }

    private void pauseWorkoutForeground() {
        if (this.isRunning) {
            long now = System.currentTimeMillis();
            this.elapsedSeconds = (now - this.baseTime) / 1000;
            this.isRunning = false;

            Notification notification = buildNotification(this.currentWorkoutName, false, this.elapsedSeconds);
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.notify(NOTIFICATION_ID, notification);
            }
        }
    }

    private void resumeWorkoutForeground(long customElapsedSeconds) {
        if (!this.isRunning) {
            if (customElapsedSeconds > 0) {
                this.elapsedSeconds = customElapsedSeconds;
            }
            this.isRunning = true;
            this.baseTime = System.currentTimeMillis() - (this.elapsedSeconds * 1000);

            Notification notification = buildNotification(this.currentWorkoutName, true, this.elapsedSeconds);
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.notify(NOTIFICATION_ID, notification);
            }
        }
    }

    private void skipRestForeground() {
        if (this.isResting) {
            restHandler.removeCallbacks(restRunnable);
            this.isResting = false;
            
            long currentElapsed = this.elapsedSeconds;
            if (this.isRunning) {
                currentElapsed = (System.currentTimeMillis() - this.baseTime) / 1000;
            }
            
            Notification notification = buildNotification(this.currentWorkoutName, this.isRunning, currentElapsed);
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.notify(NOTIFICATION_ID, notification);
            }
            
            if (listener != null) {
                listener.onAction(ACTION_SKIP_REST);
            }
        }
    }

    private void playSynthesizedChime() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    int sampleRate = 44100;
                    double durationSeconds = 0.8;
                    int numSamples = (int) (durationSeconds * sampleRate);
                    short[] sample = new short[numSamples];

                    double dt = 1.0 / sampleRate;

                    for (int i = 0; i < numSamples; i++) {
                        double currentSec = i * dt;
                        double val = 0.0;

                        // Note 1: C5 (523.25 Hz) starts at 0.0s
                        if (currentSec >= 0.0) {
                            double age = currentSec - 0.0;
                            if (age < 0.4) {
                                double amp = 0.3 * Math.exp(-5.0 * age);
                                val += amp * Math.sin(2 * Math.PI * 523.25 * currentSec);
                            }
                        }

                        // Note 2: E5 (659.25 Hz) starts at 0.15s
                        if (currentSec >= 0.15) {
                            double age = currentSec - 0.15;
                            if (age < 0.4) {
                                double amp = 0.3 * Math.exp(-5.0 * age);
                                val += amp * Math.sin(2 * Math.PI * 659.25 * currentSec);
                            }
                        }

                        // Note 3: G5 (783.99 Hz) starts at 0.30s
                        if (currentSec >= 0.30) {
                            double age = currentSec - 0.30;
                            if (age < 0.5) {
                                double amp = 0.3 * Math.exp(-4.0 * age);
                                val += amp * Math.sin(2 * Math.PI * 783.99 * currentSec);
                            }
                        }

                        if (val > 1.0) val = 1.0;
                        if (val < -1.0) val = -1.0;

                        sample[i] = (short) (val * 32767);
                    }

                    AudioTrack audioTrack = new AudioTrack(
                        AudioManager.STREAM_NOTIFICATION,
                        sampleRate,
                        AudioFormat.CHANNEL_OUT_MONO,
                        AudioFormat.ENCODING_PCM_16BIT,
                        numSamples * 2,
                        AudioTrack.MODE_STATIC
                    );

                    audioTrack.write(sample, 0, numSamples);
                    audioTrack.play();

                    Thread.sleep((long)(durationSeconds * 1000) + 100);
                    audioTrack.stop();
                    audioTrack.release();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }

    private void triggerVibration() {
        Vibrator vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        if (vibrator != null && vibrator.hasVibrator()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createWaveform(new long[]{0, 200, 100, 200}, -1));
            } else {
                vibrator.vibrate(new long[]{0, 200, 100, 200}, -1);
            }
        }
    }

    private Notification buildNotification(String workoutName, boolean isRunningState, long elapsedSec) {
        Context context = this;
        
        Intent mainIntent = new Intent(context, MainActivity.class);
        mainIntent.setAction(Intent.ACTION_MAIN);
        mainIntent.addCategory(Intent.CATEGORY_LAUNCHER);
        
        int pendingFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            pendingFlags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent contentPendingIntent = PendingIntent.getActivity(
            context, 0, mainIntent, pendingFlags
        );

        Intent pauseIntent = new Intent(context, WorkoutForegroundService.class);
        pauseIntent.setAction(ACTION_PAUSE);
        PendingIntent pausePendingIntent = PendingIntent.getService(
            context, 1, pauseIntent, pendingFlags
        );

        Intent resumeIntent = new Intent(context, WorkoutForegroundService.class);
        resumeIntent.setAction(ACTION_RESUME);
        resumeIntent.putExtra("elapsedSeconds", elapsedSec);
        PendingIntent resumePendingIntent = PendingIntent.getService(
            context, 2, resumeIntent, pendingFlags
        );

        Intent stopIntent = new Intent(context, WorkoutForegroundService.class);
        stopIntent.setAction(ACTION_STOP);
        PendingIntent stopPendingIntent = PendingIntent.getService(
            context, 3, stopIntent, pendingFlags
        );

        Intent skipRestIntent = new Intent(context, WorkoutForegroundService.class);
        skipRestIntent.setAction(ACTION_SKIP_REST);
        PendingIntent skipRestPendingIntent = PendingIntent.getService(
            context, 4, skipRestIntent, pendingFlags
        );

        int iconResId = context.getApplicationInfo().icon;
        if (iconResId == 0) {
            iconResId = android.R.drawable.ic_media_play;
        }

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(iconResId)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setContentIntent(contentPendingIntent)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setCategory(NotificationCompat.CATEGORY_WORKOUT);

        if (this.isResting) {
            builder.setContentTitle("Dinlenme Süresi");
            builder.setContentText("Sıradaki: " + currentWorkoutName);
            builder.setUsesChronometer(true);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                builder.setChronometerCountDown(true);
            }
            builder.setWhen(this.restEndTime);

            builder.addAction(
                android.R.drawable.ic_media_next,
                "Dinlenmeyi Geç",
                skipRestPendingIntent
            );
        } else if (isRunningState) {
            builder.setContentTitle(workoutName != null ? workoutName : "AuraFit - Antrenman");
            builder.setContentText("Antrenman devam ediyor...");
            long bTime = System.currentTimeMillis() - (elapsedSec * 1000);
            builder.setUsesChronometer(true);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                builder.setChronometerCountDown(false);
            }
            builder.setWhen(bTime);
            
            builder.addAction(
                android.R.drawable.ic_media_pause,
                "Duraklat",
                pausePendingIntent
            );
        } else {
            builder.setContentTitle(workoutName != null ? workoutName : "AuraFit - Antrenman");
            long minutes = elapsedSec / 60;
            long seconds = elapsedSec % 60;
            String timeStr = String.format("%02d:%02d", minutes, seconds);
            builder.setContentText("Duraklatıldı • Süre: " + timeStr);
            builder.setUsesChronometer(false);
            
            builder.addAction(
                android.R.drawable.ic_media_play,
                "Devam Et",
                resumePendingIntent
            );
        }

        builder.addAction(
            android.R.drawable.ic_menu_close_clear_cancel,
            "Bitir",
            stopPendingIntent
        );

        return builder.build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Aktif Antrenman Sayaç Servisi",
                NotificationManager.IMPORTANCE_DEFAULT
            );
            channel.setDescription("Aktif antrenman süresini ve durumunu kilit ekranında ve bildirim çubuğunda gösterir.");
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        isRunning = false;
        isResting = false;
        restHandler.removeCallbacks(restRunnable);
    }
}
