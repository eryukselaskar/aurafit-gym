package com.aurafit.app;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "WorkoutService",
    permissions = {
        @Permission(
            strings = { Manifest.permission.POST_NOTIFICATIONS },
            alias = "notifications"
        )
    }
)
public class WorkoutServicePlugin extends Plugin {

    @Override
    public void load() {
        super.load();
        
        WorkoutForegroundService.setListener(new WorkoutForegroundService.ServiceListener() {
            @Override
            public void onAction(String action) {
                JSObject data = new JSObject();
                if (WorkoutForegroundService.ACTION_PAUSE.equals(action)) {
                    data.put("action", "pause");
                } else if (WorkoutForegroundService.ACTION_RESUME.equals(action)) {
                    data.put("action", "resume");
                } else if (WorkoutForegroundService.ACTION_STOP.equals(action)) {
                    data.put("action", "finish");
                } else if (WorkoutForegroundService.ACTION_SKIP_REST.equals(action)) {
                    data.put("action", "skipRest");
                }
                notifyListeners("workoutAction", data);
            }
        });
    }

    @PluginMethod
    public void startWorkout(PluginCall call) {
        Context context = getContext();
        String workoutName = call.getString("workoutName", "AuraFit - Antrenman");
        int elapsedSeconds = call.getInt("elapsedSeconds", 0);

        Intent intent = new Intent(context, WorkoutForegroundService.class);
        intent.setAction(WorkoutForegroundService.ACTION_START);
        intent.putExtra("workoutName", workoutName);
        intent.putExtra("elapsedSeconds", (long) elapsedSeconds);

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent);
            } else {
                context.startService(intent);
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to start foreground service: " + e.getMessage());
        }
    }

    @PluginMethod
    public void updateWorkout(PluginCall call) {
        Context context = getContext();
        String workoutName = call.getString("workoutName");
        Boolean isResting = call.getBoolean("isResting", false);
        Integer restSecondsLeft = call.getInt("restSecondsLeft", 0);

        Intent intent = new Intent(context, WorkoutForegroundService.class);
        intent.setAction(WorkoutForegroundService.ACTION_UPDATE);
        if (workoutName != null) {
            intent.putExtra("workoutName", workoutName);
        }
        intent.putExtra("isResting", isResting);
        intent.putExtra("restSecondsLeft", restSecondsLeft);

        try {
            context.startService(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to update foreground service: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stopWorkout(PluginCall call) {
        Context context = getContext();
        Intent intent = new Intent(context, WorkoutForegroundService.class);
        intent.setAction(WorkoutForegroundService.ACTION_STOP);

        try {
            context.startService(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to stop foreground service: " + e.getMessage());
        }
    }

    @PluginMethod
    public void pauseWorkout(PluginCall call) {
        Context context = getContext();
        Intent intent = new Intent(context, WorkoutForegroundService.class);
        intent.setAction(WorkoutForegroundService.ACTION_PAUSE);

        try {
            context.startService(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to pause foreground service: " + e.getMessage());
        }
    }

    @PluginMethod
    public void resumeWorkout(PluginCall call) {
        Context context = getContext();
        int elapsedSeconds = call.getInt("elapsedSeconds", 0);

        Intent intent = new Intent(context, WorkoutForegroundService.class);
        intent.setAction(WorkoutForegroundService.ACTION_RESUME);
        intent.putExtra("elapsedSeconds", (long) elapsedSeconds);

        try {
            context.startService(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to resume foreground service: " + e.getMessage());
        }
    }

    @PluginMethod
    public void requestNotificationPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (getPermissionState("notifications") != PermissionState.GRANTED) {
                requestPermissionForAlias("notifications", call, "notificationsCallback");
                return;
            }
        }
        JSObject ret = new JSObject();
        ret.put("status", "granted");
        call.resolve(ret);
    }

    @PermissionCallback
    private void notificationsCallback(PluginCall call) {
        JSObject ret = new JSObject();
        if (getPermissionState("notifications") == PermissionState.GRANTED) {
            ret.put("status", "granted");
        } else {
            ret.put("status", "denied");
        }
        call.resolve(ret);
    }
}
