/*******************************************************************************
 * Copyright (c) 2012-2017 Codenvy, S.A.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Codenvy, S.A. - initial API and implementation
 *******************************************************************************/
package org.eclipse.che.plugin.jdb.server.util;

import com.google.common.collect.ImmutableMap;
import com.sun.jdi.VirtualMachine;

import org.eclipse.che.api.debug.shared.model.Breakpoint;
import org.eclipse.che.api.debug.shared.model.Location;
import org.eclipse.che.api.debug.shared.model.event.DebuggerEvent;
import org.eclipse.che.api.debug.shared.model.event.SuspendEvent;
import org.eclipse.che.api.debug.shared.model.impl.action.StartActionImpl;
import org.eclipse.che.plugin.jdb.server.JavaDebugger;
import org.eclipse.che.plugin.jdb.server.JavaDebuggerFactory;

import java.lang.reflect.Field;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.BlockingQueue;

import static java.lang.System.getProperty;

/**
 * @author Anatolii Bazko
 */
public class JavaDebuggerUtils {

    /**
     * Terminates Virtual Machine.
     *
     * @see VirtualMachine#exit(int)
     */
    public static void terminateVirtualMachineQuietly(JavaDebugger javaDebugger) throws Exception {
        Field vmField = JavaDebugger.class.getDeclaredField("vm");
        vmField.setAccessible(true);
        VirtualMachine vm = (VirtualMachine)vmField.get(javaDebugger);

        try {
            vm.exit(0);
            vm.process().waitFor();
        } catch (Exception ignored) {
        }
    }

    /**
     * Connects to process and starts debug.
     */
    public static JavaDebugger startJavaDebugger(Breakpoint breakpoint, BlockingQueue<DebuggerEvent> callback) throws Exception {
        Map<String, String> connectionProperties = ImmutableMap.of("host", "localhost",
                                                                   "port", getProperty("debug.port"));

        JavaDebuggerFactory factory = new JavaDebuggerFactory();
        JavaDebugger debugger = (JavaDebugger)factory.create(connectionProperties, callback::add);

        debugger.start(new StartActionImpl(Collections.singletonList(breakpoint)));

        return debugger;
    }

    public static void ensureSuspendAtDesiredLocation(Location desiredLocation,
                                                      BlockingQueue<DebuggerEvent> callback) throws InterruptedException {
        for (; ; ) {
            DebuggerEvent event = callback.take();
            if (event instanceof SuspendEvent) {
                SuspendEvent suspendEvent = (SuspendEvent)event;
                Location location = suspendEvent.getLocation();

                if (location.getTarget().equals(desiredLocation.getTarget())
                    && location.getLineNumber() == desiredLocation.getLineNumber()) {

                    return;
                }
            }
        }
    }
}