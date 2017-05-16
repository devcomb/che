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
package org.eclipse.che.plugin.testing.ide.messages;

import org.eclipse.che.api.testing.shared.messages.TestingMessageNames;

/**
 *
 */
public class TestFinished extends BaseTestMessage {

    static {
        messageConstructors.put(TestingMessageNames.TEST_FINISHED, TestFinished::new);
    }

    TestFinished() {
    }

    @Override
    public void visit(TestingMessageVisitor visitor) {
        visitor.visitTestFinished(this);
    }

    public Integer getTestDuration() {
        try {
            String duration = getAttributeValue("duration");
            if (duration == null) {
                return 0;
            }
            return Integer.valueOf(duration);
        } catch (NumberFormatException e) {
            return 0;
        }

    }
}